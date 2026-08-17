'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Rocket, Briefcase, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserRole } from '@/lib/enums';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.FOUNDER);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const { register } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email address';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';

    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      await register(email, password, role);
      success('Account created! Please verify your email.');
      router.push('/dashboard');
    } catch {
      error('Registration failed. Please try again.');
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
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Create your account</h1>
          <p className="text-neutral-500">Join the founder-investor marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4" noValidate>
          {/* Role Selection */}
          <div>
            <span className="label">I am a...</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole(UserRole.FOUNDER)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  role === UserRole.FOUNDER
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
                aria-pressed={role === UserRole.FOUNDER}
              >
                <Briefcase className="h-6 w-6 text-primary-500 mb-2" />
                <span className="block font-medium text-neutral-900">Founder</span>
                <span className="text-xs text-neutral-500">I'm raising capital</span>
              </button>
              <button
                type="button"
                onClick={() => setRole(UserRole.INVESTOR)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  role === UserRole.INVESTOR
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
                aria-pressed={role === UserRole.INVESTOR}
              >
                <TrendingUp className="h-6 w-6 text-secondary-500 mb-2" />
                <span className="block font-medium text-neutral-900">Investor</span>
                <span className="text-xs text-neutral-500">I'm looking to invest</span>
              </button>
            </div>
          </div>

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
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="new-password"
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            autoComplete="new-password"
            required
          />

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Create Account
          </Button>

          <p className="text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-500 hover:text-primary-600 font-medium">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}