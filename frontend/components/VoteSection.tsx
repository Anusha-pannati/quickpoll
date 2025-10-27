'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Check, Lock, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { votePoll } from '@/lib/store/slices/pollsSlice';

interface VoteSectionProps {
  pollId: number;
  options: Array<{
    id: number;
    text: string;
    vote_count: number;
  }>;
  totalVotes: number;
  userHasVoted: boolean;
  userVotedOptions?: number[];
  allowMultipleVotes: boolean;
}

export default function VoteSection({
  pollId,
  options,
  totalVotes,
  userHasVoted,
  userVotedOptions = [],
  allowMultipleVotes,
}: VoteSectionProps) {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userVotedOptions.length > 0 && !allowMultipleVotes) {
      setSelectedOption(userVotedOptions[0]);
    }
  }, [allowMultipleVotes, userVotedOptions]);

  const totalVotesLabel = useMemo(
    () => `${totalVotes.toLocaleString()} ${totalVotes === 1 ? 'vote' : 'votes'}`,
    [totalVotes]
  );

  const getPercentage = (voteCount: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((voteCount / totalVotes) * 100);
  };

  const handleVote = async (optionId: number) => {
    if (!isAuthenticated) {
      setError('Please sign in to cast your vote.');
      return;
    }

    if (!token || voting) return;

    setVoting(true);
    setError('');

    try {
      await dispatch(votePoll({ pollId, optionId, token })).unwrap();
      setSelectedOption(optionId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit vote';
      setError(message);
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="bg-primary/10 text-primary">
          <Sparkles className="mr-1 h-3.5 w-3.5" /> Live results
        </Badge>
        <Badge variant="secondary" className="bg-secondary/30 text-secondary-foreground">
          {totalVotesLabel}
        </Badge>
        {allowMultipleVotes && (
          <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
            You can pick multiple options
          </Badge>
        )}
      </div>

      {error && (
        <div className="animate-in fade-in slide-in-from-top-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-3">
        {options.map((option) => {
          const percentage = getPercentage(option.vote_count);
          const hasUserSelected = userVotedOptions.includes(option.id);
          const isSelected = selectedOption === option.id || hasUserSelected;
          const canVoteThisOption =
            isAuthenticated &&
            !voting &&
            (allowMultipleVotes ? !hasUserSelected : !userHasVoted);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleVote(option.id)}
              disabled={!canVoteThisOption}
              className={cn(
                'relative overflow-hidden rounded-xl border border-border/60 bg-background/70 p-[2px] text-left shadow-sm transition-all duration-500 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 disabled:cursor-not-allowed',
                'animate-in fade-in slide-in-from-bottom-3',
                { 'hover:-translate-y-0.5': canVoteThisOption },
                { 'opacity-60': !canVoteThisOption && !isSelected }
              )}
            >
              <div className="relative flex items-center justify-between gap-4 rounded-[0.85rem] bg-gradient-to-r from-background via-background to-background px-4 py-4">
                <div className="flex-1">
                  <p className="text-base font-medium text-foreground sm:text-lg">{option.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {option.vote_count.toLocaleString()} {option.vote_count === 1 ? 'vote' : 'votes'}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xl font-semibold text-primary sm:text-2xl">{percentage}%</p>
                  </div>

                  {(isSelected || hasUserSelected) && (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </div>

                <div
                  className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(90deg, rgba(59,130,246,0.2) ${Math.max(
                      percentage,
                      isSelected ? 24 : 12
                    )}%, transparent 100%)`,
                    opacity: isSelected ? 1 : 0.4,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {!isAuthenticated && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Lock className="h-4 w-4" /> Sign in to vote on this poll.
          </span>
          <Button asChild size="sm" variant="outline">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      )}

      {isAuthenticated && userHasVoted && !allowMultipleVotes && (
        <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          <span className="inline-flex items-center gap-2">
            <Check className="h-4 w-4" /> You have already voted on this poll.
          </span>
        </div>
      )}
    </div>
  );
}