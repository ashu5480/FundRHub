'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Rocket, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';

export default function ComingSoonPage() {
  const { success } = useToast();
  const [email, setEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState({
    days: 30,
    hours: 12,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      success('Thanks! We\'ll notify you when we launch.');
      setEmail('');
    }
  };

  const timeBoxes = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-4 relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Animated background blobs */}
      <motion.div
        className="absolute top-20 left-20 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-200/30 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-64 h-64 bg-warning-200/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.4, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-2xl text-center"
      >
        <motion.div
          className="flex items-center justify-center gap-3 mb-8"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="flex items-center justify-center h-16 w-16 rounded-2xl bg-primary-500 text-white shadow-lg shadow-primary-500/30">
            <Rocket className="h-8 w-8" />
          </span>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-6xl font-bold text-neutral-900 mb-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Something <span className="text-primary-500">Amazing</span> is Coming
        </motion.h1>

        <motion.p
          className="text-xl text-neutral-600 mb-10 max-w-xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          We're building the future of founder-investor connections. Stay tuned for the
          launch of FundrHub!
        </motion.p>

        {/* Countdown */}
        <motion.div
          className="grid grid-cols-4 gap-4 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {timeBoxes.map((box) => (
            <motion.div
              key={box.label}
              className="bg-white/80 backdrop-blur border border-neutral-200 rounded-2xl p-4 shadow-card"
              whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="text-4xl md:text-5xl font-bold text-primary-500 tabular-nums">
                {String(box.value).padStart(2, '0')}
              </div>
              <div className="text-sm text-neutral-500 mt-1">{box.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Notify form */}
        <motion.form
          onSubmit={handleNotify}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex-1 relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              required
            />
          </div>
          <Button type="submit">Notify Me</Button>
        </motion.form>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Link href="/" className="text-primary-500 hover:text-primary-600 inline-flex items-center gap-1">
            Back to Home
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}