import CreatePollForm from '@/components/CreatePollForm';

export default function CreatePollPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] py-12">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)_/_0.1),transparent_50%)]" />
      <CreatePollForm />
    </div>
  );
}