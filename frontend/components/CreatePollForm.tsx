'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { createPoll } from '@/lib/store/slices/pollsSlice';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, AlertCircle, Loader2, FileText, ListChecks } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreatePollForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const validOptions = options.filter((opt) => opt.trim() !== '');
    if (validOptions.length < 2) {
      setError('At least 2 options are required');
      return;
    }

    if (!token) {
      setError('You must be logged in to create a poll');
      return;
    }

    setLoading(true);

    try {
      await dispatch(
        createPoll({
          pollData: {
            title: title.trim(),
            description: description.trim() || undefined,
            options: validOptions,
            allow_multiple_votes: allowMultipleVotes,
          },
          token,
        })
      ).unwrap();

      router.push('/polls');
    } catch (err) {
      setError((err as string) || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-2xl border-border/50 backdrop-blur">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-3xl">Create New Poll</CardTitle>
          </div>
          <CardDescription className="text-base">
            Ask a question and provide options for people to vote on
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Poll Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question?"
              maxLength={200}
              className="text-base h-11"
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/200 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more context to your poll..."
              rows={3}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/500 characters
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Poll Options <span className="text-destructive">*</span>
              </Label>
              <Badge variant="secondary" className="gap-1.5">
                <ListChecks className="h-3.5 w-3.5" />
                {options.filter((opt) => opt.trim()).length} of {options.length} filled
              </Badge>
            </div>

            <div className="space-y-3">
              {options.map((option, index) => (
                <motion.div 
                  key={index} 
                  className="flex gap-2 items-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      maxLength={100}
                      className="text-base h-11"
                    />
                  </div>
                  
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveOption(index)}
                      className="shrink-0 h-11 w-11"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>

            {options.length < 10 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleAddOption}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            )}

            <p className="text-xs text-muted-foreground">
              Maximum 10 options allowed
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <Label className="text-base font-semibold">Settings</Label>
            
            <div className="flex items-start space-x-3 rounded-lg border border-border/50 bg-muted/50 p-4">
              <Checkbox
                id="multiple-votes"
                checked={allowMultipleVotes}
                onCheckedChange={(checked) => setAllowMultipleVotes(checked as boolean)}
                className="mt-0.5"
              />
              <div className="flex-1 space-y-1">
                <label
                  htmlFor="multiple-votes"
                  className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Allow multiple votes per user
                </label>
                <p className="text-xs text-muted-foreground">
                  Users can vote for more than one option
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-11"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Poll'
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
              size="lg"
              className="h-11"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.form>
  );
}