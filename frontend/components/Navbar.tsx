'use client';

import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { logout } from '@/lib/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, LogOut, User, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">QuickPoll</span>
          </Link>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Badge variant="secondary" className="hidden gap-1.5 sm:inline-flex">
                  <User className="h-3.5 w-3.5" />
                  {user?.username || 'User'}
                </Badge>
                <Button asChild size="default" className="gap-2">
                  <Link href="/polls/create">
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Create Poll</span>
                    <span className="sm:hidden">Create</span>
                  </Link>
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="default"
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="default">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild size="default">
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}