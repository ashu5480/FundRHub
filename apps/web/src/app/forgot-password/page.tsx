'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Rocket, Mail } from 'lucide-react';
import { apiPost, ApiError } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { success } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    setIsLoading(true);
    try {
      const data = await apiPost<{ message: string; demoToken?: string }>('/auth/forgot-password', { email });
      // In the demo build, the API returns a demoToken so we can navigate to reset page
      if (data.demoToken) {
        success('Reset link sent! (Demo)');
        router.push(`/reset-password?token=${data.demoToken}`);
      } else {
        success('If that email exists, a reset link has been sent.');
        router.push('/login');
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary-500 text-white">
              <Rocket className="h-6 w-6" />
            </span>
            <span className="text-2xl font-bold text-neutral-900">FundrHub</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Forgot your password?</h1>
          <p className="text-neutral-500">Enter your email and we'll send you a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error ?? undefined}
            autoComplete="email"
            required
          />
          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            <Mail className="h-4 w-4 mr-2" />
            Send Reset Link
          </Button>
          <p className="text-center text-sm text-neutral-500">
            Remember your password?{' '}
            <Link href="/login" className="text-primary-500 hover:text-primary-600 font-medium">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
