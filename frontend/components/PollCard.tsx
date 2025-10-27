'use client';

import Link from 'next/link';
import { CalendarDays, Heart, Sparkles, UserRound } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import VoteSection from '@/components/VoteSection';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import type { Poll } from '@/lib/store/slices/pollsSlice';
import { likePoll, unlikePoll } from '@/lib/store/slices/pollsSlice';

interface PollCardProps {
  poll: Poll;
}

export default function PollCard({ poll }: PollCardProps) {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLike = async () => {
    if (!token) return;

    try {
      if (poll.user_has_liked) {
        await dispatch(unlikePoll({ pollId: poll.id, token })).unwrap();
      } else {
        await dispatch(likePoll({ pollId: poll.id, token })).unwrap();
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const totalVotesLabel = poll.total_votes === 1 ? 'vote' : 'votes';
  const likeLabel = poll.user_has_liked ? 'Liked' : 'Like this poll';

  return (
    <Card className="group relative overflow-hidden border-border/60 bg-card/80 shadow-lg backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-all duration-700 group-hover:opacity-100" />

      <CardHeader className="relative z-10 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={`border-transparent px-3 py-1 text-xs font-medium uppercase tracking-wide ${
              poll.is_active
                ? 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-200'
                : 'bg-muted/70 text-muted-foreground'
            }`}
          >
            {poll.is_active ? 'Live poll' : 'Closed poll'}
          </Badge>
          {poll.allow_multiple_votes && (
            <Badge variant="secondary" className="bg-primary/20 text-primary shadow-sm">
              Multi-vote enabled
            </Badge>
          )}
        </div>

        <CardTitle className="text-2xl font-semibold tracking-tight">
          <Link
            href={`/polls/${poll.id}`}
            className="relative inline-flex items-center gap-2 text-foreground transition-colors hover:text-primary"
          >
            {poll.title}
          </Link>
        </CardTitle>

        {poll.description && (
          <CardDescription className="text-base leading-relaxed text-muted-foreground">
            {poll.description}
          </CardDescription>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <UserRound className="h-4 w-4 text-primary/70" />
            {poll.creator_username}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-primary/70" />
            {new Date(poll.created_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary/70" />
            {poll.total_votes.toLocaleString()} {totalVotesLabel}
          </span>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-6">
        <VoteSection
          pollId={poll.id}
          options={poll.options}
          totalVotes={poll.total_votes}
          userHasVoted={poll.user_has_voted}
          userVotedOptions={poll.user_voted_options}
          allowMultipleVotes={poll.allow_multiple_votes}
        />
      </CardContent>

      <CardFooter className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-6">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Heart
            className={`h-4 w-4 ${poll.user_has_liked ? 'text-rose-500' : 'text-muted-foreground/70'}`}
            fill={poll.user_has_liked ? 'currentColor' : 'none'}
          />
          {poll.total_likes.toLocaleString()} likes
        </div>

        <div className="flex items-center gap-3">
          {!isAuthenticated && (
            <Badge variant="outline" className="hidden text-muted-foreground sm:inline-flex">
              Sign in to react
            </Badge>
          )}

          <Button
            type="button"
            onClick={handleLike}
            disabled={!isAuthenticated || !token}
            variant={poll.user_has_liked ? 'secondary' : 'outline'}
            size="lg"
            className={`transition-all duration-300 ${
              poll.user_has_liked
                ? 'bg-rose-500/90 text-white hover:bg-rose-500'
                : 'border-primary/40 hover:border-primary hover:text-primary'
            } ${!isAuthenticated || !token ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <Heart
              className={`h-4 w-4 ${poll.user_has_liked ? 'fill-current' : ''}`}
            />
            {likeLabel}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}