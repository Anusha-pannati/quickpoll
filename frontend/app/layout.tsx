import type { Metadata } from 'next';
import './globals.css';
import StoreProvider from '@/lib/store/StoreProvider';
import { AuthInitializer } from '@/components/AuthInitializer';

export const metadata: Metadata = {
  title: 'QuickPoll - Real-Time Opinion Polling',
  description: 'Create polls, vote, and see live results in real-time',
  icons: {
    icon: "/poll.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <AuthInitializer />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
