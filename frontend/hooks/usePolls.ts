'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { fetchPolls, fetchPoll } from '@/lib/store/slices/pollsSlice';

/**
 * Custom hook to fetch all polls
 * Automatically fetches polls on mount and provides loading/error states
 */
export function usePolls() {
  const dispatch = useAppDispatch();
  const { polls, loading, error } = useAppSelector((state) => state.polls);
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchPolls(token));
  }, [dispatch, token]);

  const refetch = () => {
    dispatch(fetchPolls(token));
  };

  return {
    polls,
    loading,
    error,
    refetch,
  };
}

/**
 * Custom hook to fetch a single poll by ID
 * @param pollId - The ID of the poll to fetch
 */
export function usePoll(pollId: number) {
  const dispatch = useAppDispatch();
  const { currentPoll, loading, error } = useAppSelector((state) => state.polls);
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (pollId) {
      dispatch(fetchPoll({ pollId, token }));
    }
  }, [dispatch, pollId, token]);

  const refetch = () => {
    if (pollId) {
      dispatch(fetchPoll({ pollId, token }));
    }
  };

  return {
    poll: currentPoll,
    loading,
    error,
    refetch,
  };
}

/**
 * Custom hook to get polls state without fetching
 * Useful when you just need access to the polls data
 */
export function usePollsState() {
  const { polls, currentPoll, loading, error } = useAppSelector((state) => state.polls);

  return {
    polls,
    currentPoll,
    loading,
    error,
  };
}
