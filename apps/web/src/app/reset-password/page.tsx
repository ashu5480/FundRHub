'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Rocket, Key, Eye, EyeOff } from 'lucide-react';
import { apiPost, ApiError } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { success } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!token) {
      setError('Reset token is missing');
      return;
    }
    setIsLoading(true);
    try {
      await apiPost('/auth/reset-password', { token, password });
      success('Password reset successfully!');
      router.push('/login');
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
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Reset your password</h1>
          <p className="text-neutral-500">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4" noValidate>
          <div className="relative">
            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error ?? undefined}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-10 text-neutral-400 hover:text-neutral-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="relative">
            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            <Key className="h-4 w-4 mr-2" />
            Reset Password
          </Button>
          <p className="text-center text-sm text-neutral-500">
            <Link href="/login" className="text-primary-500 hover:text-primary-600 font-medium">
              Back to Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
