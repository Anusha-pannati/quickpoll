'use client';

import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Heart, BarChart3, CheckCircle } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)_/_0.15),transparent_50%)]" />
      
      <div className="flex flex-col items-center justify-center px-4 py-20 min-h-screen">
        <motion.div 
          className="max-w-7xl w-full space-y-20"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="flex flex-col text-center space-y-8 items-center">
            <motion.div variants={itemVariants}>
              <Badge 
                variant="outline" 
                className="gap-2 px-4 py-2 text-sm font-medium border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <Zap className="h-3.5 w-3.5" />
                Real-time polling platform
              </Badge>
            </motion.div>

            <motion.div className="space-y-6" variants={itemVariants}>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
                <span className="bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                  Welcome to{' '}
                </span>
                <span className="text-gradient">
                  QuickPoll
                </span>
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Create polls, vote, and see live results in real-time. 
                <span className="block mt-2 text-base md:text-lg">
                  Your opinion matters. Make it count.
                </span>
              </p>
            </motion.div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center pt-6"
              variants={itemVariants}
            >
              <Button 
                asChild
                size="lg" 
                className="group w-full sm:w-auto min-w-48 text-base h-12 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
              >
                <Link href="/polls">
                  Browse Polls
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button 
                asChild
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto min-w-48 text-base h-12 border-2 hover:bg-primary/5 transition-all duration-300"
              >
                <Link href="/register">
                  Get Started
                </Link>
              </Button>
            </motion.div>

            <motion.div 
              className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Instant results</span>
              </div>
            </motion.div>
          </div>

          <motion.div className="space-y-8" variants={itemVariants}>
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold">
                Everything you need
              </h2>
              <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
                Powerful features designed to make polling simple and engaging
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <motion.div variants={cardVariants}>
                <Card className="relative group overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border hover:border-primary/30 bg-card/50 backdrop-blur h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardHeader className="space-y-5 pb-8 relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <BarChart3 className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-3">
                      <CardTitle className="text-2xl">Create Polls</CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        Easily create polls with multiple options in seconds. 
                        Customize your questions and watch engagement grow.
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>

              <motion.div variants={cardVariants}>
                <Card className="relative group overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border hover:border-primary/30 bg-card/50 backdrop-blur h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardHeader className="space-y-5 pb-8 relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Zap className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-3">
                      <CardTitle className="text-2xl">Real-Time Updates</CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        See votes and likes update instantly as people interact. 
                        No refresh needed—everything happens live.
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>

              <motion.div variants={cardVariants}>
                <Card className="relative group overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border hover:border-primary/30 bg-card/50 backdrop-blur h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardHeader className="space-y-5 pb-8 relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Heart className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-3">
                      <CardTitle className="text-2xl">Engage & Like</CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        Vote on polls and like your favorites. 
                        Show support and discover trending opinions.
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-12 md:p-16 text-center shadow-2xl"
            variants={itemVariants}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(var(--primary)_/_0.1),transparent_70%)]" />
            <div className="relative space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                Ready to get started?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands creating and sharing polls every day
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  asChild
                  size="lg" 
                  className="group w-full sm:w-auto min-w-48 text-base h-12 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                >
                  <Link href="/register">
                    Create Your First Poll
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button 
                  asChild
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto min-w-48 text-base h-12 border-2 hover:bg-background/50 transition-all duration-300"
                >
                  <Link href="/polls">
                    Explore Polls
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}