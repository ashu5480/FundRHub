'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Rocket } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { login } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email address';

    if (!password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      const ok = await login(email, password);
      if (ok) {
        success('Welcome back!');
        router.push(next);
        router.refresh();
      }
    } catch (err) {
      error(err instanceof Error ? err.message : 'Login failed. Please try again.');
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
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Welcome back</h1>
          <p className="text-neutral-500">Login to continue your fundraising journey</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="current-password"
            required
          />

          <div className="flex items-center justify-between">
            <Link href="/forgot-password" className="text-sm text-primary-500 hover:text-primary-600">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Login
          </Button>

          <p className="text-center text-sm text-neutral-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary-500 hover:text-primary-600 font-medium">
              Register
            </Link>
          </p>
        </form>

        <div className="mt-6 p-4 bg-primary-50 rounded-lg">
          <p className="text-sm text-primary-700">
            <strong>Demo credentials:</strong> Use{' '}
            <code className="bg-white px-1.5 py-0.5 rounded text-xs">founder@fundrhub.com</code> (password{' '}
            <code className="bg-white px-1.5 py-0.5 rounded text-xs">password123</code>) for the founder view,{' '}
            <code className="bg-white px-1.5 py-0.5 rounded text-xs">investor@fundrhub.com</code> for the investor
            view, or <code className="bg-white px-1.5 py-0.5 rounded text-xs">admin@fundrhub.com</code> for the admin
            console.
          </p>
        </div>
      </div>
    </div>
  );
}