import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Authentication - QuickPoll',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)_/_0.15),transparent_50%)]" />
      
      <div className="container mx-auto px-4 py-8">
        <Button asChild variant="ghost" size="lg" className="gap-2 mb-8">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-primary">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gradient">QuickPoll</span>
            </div>
          </Link>
        </Button>
        
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] w-screen">
          {children}
        </div>
      </div>
    </div>
  );
}