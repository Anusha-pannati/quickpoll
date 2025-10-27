import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { RootState } from '../store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PollOption {
  id: number;
  poll_id: number;
  text: string;
  vote_count: number;
}

export interface Poll {
  id: number;
  title: string;
  description?: string;
  creator_id: number;
  creator_username: string;
  is_active: boolean;
  allow_multiple_votes: boolean;
  created_at: string;
  options: PollOption[];
  total_votes: number;
  total_likes: number;
  user_has_voted: boolean;
  user_has_liked: boolean;
  user_voted_options: number[];
}

interface PollsState {
  polls: Poll[];
  currentPoll: Poll | null;
  loading: boolean;
  error: string | null;
}

type LikeToggleResult = {
  pollId: number;
  adjustCount: boolean;
};

type PollLike = Omit<Poll, 'options' | 'total_votes' | 'total_likes' | 'user_voted_options' | 'user_has_voted' | 'user_has_liked'> & {
  options: Array<Partial<PollOption>>;
  total_votes?: unknown;
  total_likes?: unknown;
  user_voted_options?: unknown;
  user_has_voted?: unknown;
  user_has_liked?: unknown;
};

const initialState: PollsState = {
  polls: [],
  currentPoll: null,
  loading: false,
  error: null,
};

const isWebSocketConnected = (state: RootState | undefined): boolean =>
  Boolean(state?.websocket?.connected);

const ensureNumber = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const ensureBoolean = (value: unknown): boolean => value === true;

const coerceUserVotes = (votes: unknown): number[] => {
  if (!Array.isArray(votes)) {
    return [];
  }

  const uniqueVotes = new Set<number>();

  votes.forEach((value) => {
    const numericValue = ensureNumber(value);
    if (numericValue > 0) {
      uniqueVotes.add(numericValue);
    }
  });

  return Array.from(uniqueVotes);
};

const coercePoll = (rawPoll: PollLike | Poll): Poll => {
  const poll = rawPoll as PollLike;
  const normalisedOptions: PollOption[] = (poll.options ?? []).map((option) => ({
    id: Number(option?.id ?? 0),
    poll_id: Number(option?.poll_id ?? 0),
    text: option?.text ?? '',
    vote_count: ensureNumber(option?.vote_count),
  }));

  return {
    id: Number(poll.id),
    title: poll.title,
    description: poll.description,
    creator_id: Number(poll.creator_id),
    creator_username: poll.creator_username,
    is_active: ensureBoolean(poll.is_active),
    allow_multiple_votes: ensureBoolean(poll.allow_multiple_votes),
    created_at: poll.created_at,
    options: normalisedOptions,
    total_votes: ensureNumber(poll.total_votes),
    total_likes: ensureNumber(poll.total_likes),
    user_has_voted: ensureBoolean(poll.user_has_voted),
    user_has_liked: ensureBoolean(poll.user_has_liked),
    user_voted_options: coerceUserVotes(poll.user_voted_options),
  };
};

const getVoteCount = (counts: Record<number, number>, optionId: number): number =>
  Object.prototype.hasOwnProperty.call(counts, optionId) ? counts[optionId] : 0;

const sumVoteCounts = (counts: Record<number, number>): number =>
  Object.values(counts).reduce((sum, count) => sum + ensureNumber(count), 0);

const applyVoteCounts = (options: PollOption[], voteCounts: Record<number, number>): PollOption[] =>
  options.map((option) => ({
    ...option,
    vote_count: getVoteCount(voteCounts, option.id),
  }));

const upsertPollAtTop = (state: PollsState, poll: PollLike | Poll) => {
  const normalisedPoll = coercePoll(poll);
  const existingIndex = state.polls.findIndex((item) => item.id === normalisedPoll.id);

  if (existingIndex !== -1) {
    state.polls.splice(existingIndex, 1);
  }

  state.polls.unshift(normalisedPoll);

  if (state.currentPoll?.id === normalisedPoll.id) {
    state.currentPoll = normalisedPoll;
  }
};

const getErrorDetail = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === 'object' && 'detail' in data) {
      const detail = (data as { detail?: unknown }).detail;
      if (typeof detail === 'string') {
        return detail;
      }
    }
  }
  return fallback;
};

const updateLikeState = (poll: Poll | undefined, liked: boolean, adjustCount: boolean) => {
  if (!poll) {
    return;
  }

  if (adjustCount) {
    const baseline = ensureNumber(poll.total_likes);
    const delta = liked ? 1 : -1;
    poll.total_likes = Math.max(0, baseline + delta);
  }

  poll.user_has_liked = liked;
};

// Async thunks
export const fetchPolls = createAsyncThunk(
  'polls/fetchPolls',
  async (token: string | null, { rejectWithValue }) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API_URL}/polls`, { headers });
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorDetail(error, 'Failed to fetch polls'));
    }
  }
);

export const fetchPoll = createAsyncThunk(
  'polls/fetchPoll',
  async ({ pollId, token }: { pollId: number; token: string | null }, { rejectWithValue }) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API_URL}/polls/${pollId}`, { headers });
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorDetail(error, 'Failed to fetch poll'));
    }
  }
);

export const createPoll = createAsyncThunk(
  'polls/createPoll',
  async (
    {
      pollData,
      token,
    }: {
      pollData: {
        title: string;
        description?: string;
        options: string[];
        allow_multiple_votes: boolean;
      };
      token: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`${API_URL}/polls`, pollData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorDetail(error, 'Failed to create poll'));
    }
  }
);

export const votePoll = createAsyncThunk(
  'polls/votePoll',
  async (
    {
      pollId,
      optionId,
      token,
    }: {
      pollId: number;
      optionId: number;
      token: string;
    },
    { rejectWithValue }
  ) => {
    try {
      await axios.post(
        `${API_URL}/polls/${pollId}/vote`,
        { option_id: optionId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { pollId, optionId };
    } catch (error: unknown) {
      return rejectWithValue(getErrorDetail(error, 'Failed to vote'));
    }
  }
);

export const likePoll = createAsyncThunk(
  'polls/likePoll',
  async (
    { pollId, token }: { pollId: number; token: string },
    { rejectWithValue, getState }
  ) => {
    try {
      await axios.post(
        `${API_URL}/polls/${pollId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const state = getState() as RootState | undefined;
      return {
        pollId,
        adjustCount: !isWebSocketConnected(state),
      } satisfies LikeToggleResult;
    } catch (error: unknown) {
      return rejectWithValue(getErrorDetail(error, 'Failed to like poll'));
    }
  }
);

export const unlikePoll = createAsyncThunk(
  'polls/unlikePoll',
  async (
    { pollId, token }: { pollId: number; token: string },
    { rejectWithValue, getState }
  ) => {
    try {
      await axios.delete(`${API_URL}/polls/${pollId}/like`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const state = getState() as RootState | undefined;
      return {
        pollId,
        adjustCount: !isWebSocketConnected(state),
      } satisfies LikeToggleResult;
    } catch (error: unknown) {
      return rejectWithValue(getErrorDetail(error, 'Failed to unlike poll'));
    }
  }
);

const pollsSlice = createSlice({
  name: 'polls',
  initialState,
  reducers: {
    updatePollVotes: (
      state,
      action: PayloadAction<{ pollId: number; voteCounts: Record<number, number> }>
    ) => {
      const { pollId, voteCounts } = action.payload;
      const totalVotes = sumVoteCounts(voteCounts);

      const pollIndex = state.polls.findIndex((poll) => poll.id === pollId);
      if (pollIndex !== -1) {
        state.polls[pollIndex].options = applyVoteCounts(state.polls[pollIndex].options, voteCounts);
        state.polls[pollIndex].total_votes = totalVotes;
      }

      if (state.currentPoll?.id === pollId) {
        state.currentPoll.options = applyVoteCounts(state.currentPoll.options, voteCounts);
        state.currentPoll.total_votes = totalVotes;
      }
    },
    updatePollLikes: (state, action: PayloadAction<{ pollId: number; totalLikes: number }>) => {
      const { pollId, totalLikes } = action.payload;
      const safeTotalLikes = Math.max(0, ensureNumber(totalLikes));

      const pollIndex = state.polls.findIndex((poll) => poll.id === pollId);
      if (pollIndex !== -1) {
        state.polls[pollIndex].total_likes = safeTotalLikes;
      }

      if (state.currentPoll?.id === pollId) {
        state.currentPoll.total_likes = safeTotalLikes;
      }
    },
    addNewPoll: (state, action: PayloadAction<PollLike | Poll>) => {
      upsertPollAtTop(state, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch polls
      .addCase(fetchPolls.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPolls.fulfilled, (state, action) => {
        state.loading = false;
        const incomingPolls = (action.payload as Array<PollLike | Poll>).map((poll) => coercePoll(poll));
        state.polls = incomingPolls;
        state.error = null;

        if (state.currentPoll) {
          const updated = incomingPolls.find((poll) => poll.id === state.currentPoll?.id);
          if (updated) {
            state.currentPoll = updated;
          }
        }
      })
      .addCase(fetchPolls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch single poll
      .addCase(fetchPoll.fulfilled, (state, action) => {
        const normalisedPoll = coercePoll(action.payload as PollLike | Poll);
        state.currentPoll = normalisedPoll;
        const index = state.polls.findIndex((poll) => poll.id === normalisedPoll.id);
        if (index !== -1) {
          state.polls[index] = normalisedPoll;
        }
      })
      // Create poll
      .addCase(createPoll.fulfilled, (state, action) => {
        upsertPollAtTop(state, action.payload as PollLike | Poll);
        state.error = null;
      })
      // Vote
      .addCase(votePoll.fulfilled, (state, action) => {
        const { pollId, optionId } = action.payload;

        const applyVoteToPoll = (poll?: Poll) => {
          if (!poll) {
            return;
          }

          poll.user_has_voted = true;

          if (!Array.isArray(poll.user_voted_options)) {
            poll.user_voted_options = [];
          }

          if (poll.allow_multiple_votes) {
            if (!poll.user_voted_options.includes(optionId)) {
              poll.user_voted_options.push(optionId);
            }
          } else {
            poll.user_voted_options = [optionId];
          }
        };

        const poll = state.polls.find((item) => item.id === pollId);
        applyVoteToPoll(poll);

        if (state.currentPoll?.id === pollId) {
          applyVoteToPoll(state.currentPoll);
        }
      })
      // Like
      .addCase(likePoll.fulfilled, (state, action) => {
        const { pollId, adjustCount } = action.payload;

        const poll = state.polls.find((item) => item.id === pollId);
        updateLikeState(poll, true, adjustCount);

        if (state.currentPoll?.id === pollId) {
          updateLikeState(state.currentPoll, true, adjustCount);
        }
      })
      // Unlike
      .addCase(unlikePoll.fulfilled, (state, action) => {
        const { pollId, adjustCount } = action.payload;

        const poll = state.polls.find((item) => item.id === pollId);
        updateLikeState(poll, false, adjustCount);

        if (state.currentPoll?.id === pollId) {
          updateLikeState(state.currentPoll, false, adjustCount);
        }
      });
  },
});

export const { updatePollVotes, updatePollLikes, addNewPoll } = pollsSlice.actions;
export type { PollsState };
export default pollsSlice.reducer;