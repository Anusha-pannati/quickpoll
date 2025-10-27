'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/lib/store/hooks';
import { setConnection } from '@/lib/store/slices/websocketSlice';
import { addNewPoll, updatePollLikes, updatePollVotes } from '@/lib/store/slices/pollsSlice';
import type { Poll, PollOption } from '@/lib/store/slices/pollsSlice';

const resolveWebSocketUrl = (): string => {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }

  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL);
      apiUrl.protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
      apiUrl.pathname = '/ws';
      apiUrl.search = '';
      apiUrl.hash = '';
      return apiUrl.toString();
    } catch (error) {
      console.warn('Invalid NEXT_PUBLIC_API_URL for WebSocket derivation:', error);
    }
  }

  return 'ws://localhost:8000/ws';
};

const WS_URL = resolveWebSocketUrl();

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const toOptionalString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

const normaliseVoteCounts = (counts: unknown): Record<number, number> => {
  if (!counts || typeof counts !== 'object') {
    return {};
  }

  return Object.entries(counts as Record<string, number | string>)
    .map(([key, value]) => {
      const numericKey = Number(key);
      const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
      const safeValue = Number.isFinite(numericKey) && Number.isFinite(numericValue) ? numericValue : null;
      return [numericKey, safeValue] as const;
    })
    .reduce((acc, [key, value]) => {
      if (value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<number, number>);
};

const normalisePollPayload = (data: unknown): Poll | null => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const raw = data as Record<string, unknown>;
  const pollId = toNumber(raw.id);

  if (pollId <= 0) {
    return null;
  }

  const optionsRaw = (raw as { options?: unknown }).options;
  const options: PollOption[] = Array.isArray(optionsRaw)
    ? optionsRaw.map((option) => {
        if (!option || typeof option !== 'object') {
          return {
            id: 0,
            poll_id: pollId,
            text: '',
            vote_count: 0,
          };
        }

        const optionRecord = option as Record<string, unknown>;
        return {
          id: toNumber(optionRecord.id),
          poll_id: toNumber(optionRecord.poll_id, pollId),
          text: toString(optionRecord.text),
          vote_count: toNumber(optionRecord.vote_count),
        };
      })
    : [];

  const userVotedOptionsRaw = (raw as { user_voted_options?: unknown }).user_voted_options;
  const userVotedOptions = Array.isArray(userVotedOptionsRaw)
    ? userVotedOptionsRaw
        .map((optionId) => toNumber(optionId))
        .filter((optionId) => optionId > 0)
    : [];

  return {
    id: pollId,
    title: toString(raw.title),
    description: toOptionalString(raw.description),
    creator_id: toNumber(raw.creator_id),
    creator_username: toString(raw.creator_username),
    is_active: raw.is_active !== false,
    allow_multiple_votes: Boolean(raw.allow_multiple_votes),
    created_at: toString(raw.created_at, new Date().toISOString()),
    options,
    total_votes: toNumber(raw.total_votes),
    total_likes: toNumber(raw.total_likes),
    user_has_voted: Boolean(raw.user_has_voted),
    user_has_liked: Boolean(raw.user_has_liked),
    user_voted_options: userVotedOptions,
  };
};

export const useWebSocket = (pollId?: number) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let socket: WebSocket | null = null;
    let pingInterval: ReturnType<typeof setInterval> | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let isManuallyClosing = false;

    const clearTimers = () => {
      if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
      }

      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    };

    const handleMessage = (event: MessageEvent) => {
      try {
        if (event.data === 'pong') {
          return;
        }

        const message = JSON.parse(event.data);
        if (!message?.type) {
          return;
        }

        switch (message.type) {
          case 'vote_update': {
            const pollIdentifier = Number(message.data?.poll_id);
            if (!Number.isFinite(pollIdentifier)) {
              return;
            }

            const voteCounts = normaliseVoteCounts(message.data?.vote_counts);
            dispatch(
              updatePollVotes({
                pollId: pollIdentifier,
                voteCounts,
              })
            );
            break;
          }
          case 'like_update': {
            const pollIdentifier = Number(message.data?.poll_id);
            if (!Number.isFinite(pollIdentifier)) {
              return;
            }

            const totalLikes = Number(message.data?.total_likes ?? 0);
            dispatch(
              updatePollLikes({
                pollId: pollIdentifier,
                totalLikes,
              })
            );
            break;
          }
          case 'poll_created': {
            const pollPayload = normalisePollPayload(message.data);
            if (pollPayload) {
              dispatch(addNewPoll(pollPayload));
            }
            break;
          }
          default: {
            console.debug('Unhandled WebSocket message type:', message.type);
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    const connect = () => {
      const url = pollId ? `${WS_URL}?poll_id=${pollId}` : WS_URL;
      socket = new WebSocket(url);

      socket.onopen = () => {
        console.info('WebSocket connected');
        dispatch(setConnection(socket));

        if (pingInterval) {
          clearInterval(pingInterval);
        }

        pingInterval = setInterval(() => {
          if (socket?.readyState === WebSocket.OPEN) {
            socket.send('ping');
          }
        }, 30000);
      };

      socket.onmessage = handleMessage;

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      socket.onclose = () => {
        console.info('WebSocket disconnected');
        dispatch(setConnection(null));
        clearTimers();

        if (!isManuallyClosing) {
          reconnectTimeout = setTimeout(() => {
            console.info('Attempting WebSocket reconnection...');
            connect();
          }, 3000);
        }
      };
    };

    connect();

    return () => {
      isManuallyClosing = true;
      clearTimers();

      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        socket.close(1000, 'Client closing connection');
      }

      dispatch(setConnection(null));
    };
  }, [dispatch, pollId]);
};