'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Activity,
  ArrowLeft,
  BarChart3,
  CalendarDays,
  Heart,
  Sparkles,
} from 'lucide-react';

import PollCard from '@/components/PollCard';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchPoll } from '@/lib/store/slices/pollsSlice';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PollDetailPage() {
  const params = useParams();
  const pollId = Number(params.id);
  const dispatch = useAppDispatch();
  const { currentPoll } = useAppSelector((state) => state.polls);
  const { token } = useAppSelector((state) => state.auth);

  useWebSocket(Number.isFinite(pollId) ? pollId : undefined);

  useEffect(() => {
    if (Number.isFinite(pollId)) {
      dispatch(fetchPoll({ pollId, token }));
    }
  }, [dispatch, pollId, token]);

  if (!currentPoll) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background">
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)_/_0.12),transparent_60%)]" />
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
        </div>
      </div>
    );
  }

  const createdAt = new Date(currentPoll.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)_/_0.12),transparent_60%)]" />

      <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-12 md:pt-20 space-y-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-in fade-in slide-in-from-top-4">
          <Button asChild variant="ghost" size="sm" className="group w-fit px-0 text-muted-foreground hover:text-primary">
            <Link href="/polls">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to polls
            </Link>
          </Button>
          <Badge variant="outline" className="flex items-center gap-2 border-primary/30 bg-primary/10 text-primary">
            <Activity className="h-3.5 w-3.5" /> Live updates on
          </Badge>
        </div>

        <div className="rounded-3xl border border-primary/15 bg-card/70 p-1 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-6">
          <PollCard poll={currentPoll} />
        </div>

        <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-bottom-6">
          <Badge
            variant="secondary"
            className={currentPoll.allow_multiple_votes
              ? 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200'
              : 'bg-muted/70 text-muted-foreground'}
          >
            {currentPoll.allow_multiple_votes ? 'Multiple votes allowed' : 'Single vote per user'}
          </Badge>
          <Badge
            variant="outline"
            className={currentPoll.is_active
              ? 'border-emerald-400 text-emerald-500 dark:border-emerald-400/60 dark:text-emerald-200'
              : 'border-destructive/60 text-destructive dark:border-destructive/60 dark:text-destructive'}
          >
            {currentPoll.is_active ? 'Poll is open' : 'Poll is closed'}
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 animate-in fade-in slide-in-from-bottom-6">
          <Card className="bg-card/70 shadow-inner">
            <CardContent className="flex flex-col gap-2 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <BarChart3 className="h-4 w-4 text-primary" /> Total votes
              </div>
              <p className="text-3xl font-semibold">{currentPoll.total_votes.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Updated in real time as votes arrive.</p>
            </CardContent>
          </Card>

          <Card className="bg-card/70 shadow-inner">
            <CardContent className="flex flex-col gap-2 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Heart className="h-4 w-4 text-primary" /> Community likes
              </div>
              <p className="text-3xl font-semibold">{currentPoll.total_likes.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Tap the heart to show your support.</p>
            </CardContent>
          </Card>

          <Card className="bg-card/70 shadow-inner">
            <CardContent className="flex flex-col gap-2 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <CalendarDays className="h-4 w-4 text-primary" /> Created on
              </div>
              <p className="text-lg font-semibold">{createdAt}</p>
              <p className="text-xs text-muted-foreground">By {currentPoll.creator_username}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary animate-in fade-in slide-in-from-bottom-6">
          <Sparkles className="h-4 w-4" /> Share this poll to boost engagement.
        </div>
      </div>
    </div>
  );
}