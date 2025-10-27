'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  Activity,
  BarChart3,
  Heart,
  PlusCircle,
  RefreshCcw,
  Sparkles,
  Users,
} from 'lucide-react';

import PollCard from '@/components/PollCard';
import { usePolls } from '@/hooks/usePolls';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PollsPage() {
  const { polls, loading, error, refetch } = usePolls();

  useWebSocket();

  const stats = useMemo(() => {
    const totalPolls = polls.length;
    const totalVotes = polls.reduce((sum, poll) => sum + poll.total_votes, 0);
    const totalLikes = polls.reduce((sum, poll) => sum + poll.total_likes, 0);
    const avgVotes = totalPolls ? Math.round((totalVotes / totalPolls) * 10) / 10 : 0;

    return {
      totalPolls,
      totalVotes,
      totalLikes,
      avgVotes,
      formatted: {
        totalPolls: totalPolls.toLocaleString(),
        totalVotes: totalVotes.toLocaleString(),
        totalLikes: totalLikes.toLocaleString(),
        avgVotes: avgVotes.toLocaleString(undefined, {
          minimumFractionDigits: avgVotes % 1 === 0 ? 0 : 1,
          maximumFractionDigits: 1,
        }),
      },
    };
  }, [polls]);

  const renderLoadingState = () => (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-3xl border border-border/60 bg-card/60 p-6 shadow-sm"
          aria-hidden
        >
          <div className="h-6 w-3/4 rounded-full bg-muted/50" />
          <div className="mt-3 h-4 w-1/2 rounded-full bg-muted/30" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 3 }).map((__, optionIndex) => (
              <div key={optionIndex} className="h-10 rounded-full bg-muted/20" />
            ))}
          </div>
          <div className="mt-6 h-5 w-32 rounded-full bg-muted/30" />
        </div>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <Card className="border-dashed border-primary/30 bg-card/60 backdrop-blur">
      <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold">No polls yet</h3>
          <p className="text-muted-foreground">
            Kick things off by creating the first poll and invite others to share their voice.
          </p>
        </div>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/polls/create">
            <PlusCircle className="mr-2 h-5 w-5" /> Create a poll
          </Link>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)_/_0.12),transparent_60%)]" />

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 md:pt-20">
        <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card/70 p-10 shadow-xl backdrop-blur animate-in fade-in slide-in-from-top-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_hsl(var(--primary)_/_0.12),transparent_65%)]" />
          <div className="relative flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
            <div className="space-y-6">
              <Badge
                variant="outline"
                className="w-fit border-primary/30 bg-primary/10 text-primary shadow-sm"
              >
                <span className="mr-2 inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                Live polls updating in real time
              </Badge>

              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                  Discover the pulse of your community
                </h1>
                <p className="max-w-xl text-lg text-muted-foreground">
                  Explore trending questions, cast your vote, and watch results shift instantly as people
                  interact with each poll.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={refetch}
                  disabled={loading}
                  className="group w-full sm:w-auto"
                >
                  <RefreshCcw className="mr-2 h-4 w-4 transition-transform group-hover:-rotate-45" />
                  Refresh feed
                </Button>
                <Button asChild size="lg" className="w-full sm:w-auto" disabled={loading}>
                  <Link href="/polls/create">
                    <PlusCircle className="mr-2 h-5 w-5" /> Create a poll
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid w-full max-w-sm grid-cols-2 gap-4 rounded-2xl border border-primary/30 bg-background/90 p-6 shadow-inner sm:max-w-md">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Users className="h-4 w-4 text-primary" /> Active polls
                </div>
                <p className="text-3xl font-semibold">{stats.formatted.totalPolls}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <BarChart3 className="h-4 w-4 text-primary" /> Live votes
                </div>
                <p className="text-3xl font-semibold">{stats.formatted.totalVotes}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Heart className="h-4 w-4 text-primary" /> Total likes
                </div>
                <p className="text-3xl font-semibold">{stats.formatted.totalLikes}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Activity className="h-4 w-4 text-primary" /> Avg votes / poll
                </div>
                <p className="text-3xl font-semibold">{stats.formatted.avgVotes}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14 space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">Trending polls</h2>
              <p className="text-muted-foreground">
                Stay in sync with what everyone is talking about right now.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
              <Activity className="h-4 w-4" /> Real-time updates enabled
            </div>
          </div>

          {error && (
            <Card className="border-destructive/40 bg-destructive/10 backdrop-blur">
              <CardContent className="flex flex-col gap-4 p-6">
                <div>
                  <p className="text-sm font-medium text-destructive">{error}</p>
                  <p className="text-sm text-muted-foreground">
                    Something went wrong while loading polls. Try again in a moment.
                  </p>
                </div>
                <Button variant="outline" onClick={refetch} className="w-fit">
                  <RefreshCcw className="mr-2 h-4 w-4" /> Try again
                </Button>
              </CardContent>
            </Card>
          )}

          {loading && polls.length === 0 && renderLoadingState()}

          {!loading && polls.length === 0 && !error && renderEmptyState()}

          {polls.length > 0 && (
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {polls.map((poll, index) => (
                <div key={poll.id} className="animate-in fade-in slide-in-from-bottom-6" style={{ animationDelay: `${index * 80}ms` }}>
                  <PollCard poll={poll} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}