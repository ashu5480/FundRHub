'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Rocket, KeyRound, Info } from 'lucide-react';
import { errorMessage, forgotPassword, resetPassword } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'request' | 'reset' | 'done'>('request');
  const [email, setEmail] = useState('');
  const [demoToken, setDemoToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const { success, error } = useToast();

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }
    setErrors({});
    setIsLoading(true);
    try {
      const res = await forgotPassword(email);
      if (res.demoToken) {
        setDemoToken(res.demoToken);
        setStep('reset');
        success('Reset link generated (demo mode).');
      } else {
        // Email does not exist — mirror real behaviour without leaking it.
        success('If the email exists, a reset link has been sent.');
        setStep('done');
      }
    } catch (err) {
      error(errorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      await resetPassword(demoToken, password);
      success('Password reset successfully. You can now log in.');
      setStep('done');
    } catch (err) {
      error(errorMessage(err));
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
          <p className="text-neutral-500">
            {step === 'done'
              ? 'All set — head back to the login page.'
              : step === 'reset'
                ? 'Choose a new password for your account.'
                : "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        {step === 'request' && (
          <form onSubmit={handleRequest} className="card p-6 space-y-4" noValidate>
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
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Send reset link
            </Button>
            <p className="text-center text-sm text-neutral-500">
              Remembered it?{' '}
              <Link href="/login" className="text-primary-500 hover:text-primary-600 font-medium">
                Back to login
              </Link>
            </p>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleReset} className="card p-6 space-y-4" noValidate>
            <div className="flex items-start gap-2 rounded-lg bg-primary-50 border border-primary-100 p-3 text-sm text-neutral-700">
              <Info className="h-4 w-4 mt-0.5 shrink-0 text-primary-500" />
              <p>
                Demo mode: no email provider is configured, so your reset token is{' '}
                <code className="font-mono text-xs bg-white px-1 py-0.5 rounded border border-neutral-200">{demoToken}</code>
              </p>
            </div>
            <Input
              label="New password"
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
              label="Confirm new password"
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              autoComplete="new-password"
              required
            />
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              <KeyRound className="h-4 w-4" />
              Reset password
            </Button>
          </form>
        )}

        {step === 'done' && (
          <div className="card p-6 text-center space-y-4">
            <p className="text-neutral-600">Your password has been updated.</p>
            <Link href="/login" className="btn-primary inline-flex items-center justify-center">
              Go to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
