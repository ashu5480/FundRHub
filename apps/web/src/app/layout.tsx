import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { ToastProvider } from '@/components/ui/toast';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FundrHub — Where founders meet their investors',
  description:
    'FundrHub is a structured founder-investor discovery, matching and connection platform. Find relevant investors, discover promising startups, and build trusted connections.',
  keywords: ['fundraising', 'startup', 'investor', 'founder', 'venture capital', 'angel investor'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}