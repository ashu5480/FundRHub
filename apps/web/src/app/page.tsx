'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import {
  ArrowRight,
  Search,
  Target,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Users,
  Rocket,
  Sparkles,
} from 'lucide-react';
import { mockStartups, mockInvestors, STAGE_LABELS } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';

function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${y * -8}deg) translateZ(10px)`;
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-200 ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section with 3D animation */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
        {/* Animated background blobs */}
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-200/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-warning-200/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur border border-primary-200 text-primary-600 text-sm font-medium mb-6"
            >
              <Sparkles className="h-4 w-4" />
              Where founders meet their investors
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl font-bold text-neutral-900 mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Where founders{' '}
              <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                meet
              </span>{' '}
              their investors
            </motion.h1>

            <motion.p
              className="text-xl text-neutral-600 mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              FundrHub makes fundraising discovery structured, searchable and relevant. Create
              trusted profiles, find compatible matches, and build meaningful connections.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link href="/register" className="btn-primary btn-lg">
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/startups" className="btn-secondary btn-lg">
                Explore Startups
              </Link>
            </motion.div>

            <motion.p
              className="mt-6 text-sm text-neutral-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Trusted by founders and investors across India and Southeast Asia
            </motion.p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            className="text-3xl font-bold text-center text-neutral-900 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            How it works
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: '1. Create your profile',
                desc: 'Build a structured profile with your startup details or investment preferences.',
                color: 'text-primary-500 bg-primary-50',
              },
              {
                icon: Target,
                title: '2. Get matched',
                desc: 'Our explainable matching engine finds compatible startups and investors based on your criteria.',
                color: 'text-secondary-500 bg-secondary-50',
              },
              {
                icon: MessageSquare,
                title: '3. Connect & talk',
                desc: 'Send connection requests and start private conversations with accepted connections.',
                color: 'text-warning-500 bg-warning-50',
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <TiltCard>
                  <div className={`flex items-center justify-center h-14 w-14 mx-auto rounded-2xl ${step.color} mb-4`}>
                    <step.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">{step.title}</h3>
                  <p className="text-neutral-600">{step.desc}</p>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Startups */}
      <section className="py-16 bg-white border-y border-neutral-200">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">Featured startups</h2>
            <Link href="/startups" className="btn-tertiary btn-sm">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {mockStartups.map((startup, i) => (
              <motion.div
                key={startup.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <TiltCard>
                  <Link
                    href={`/startups/${startup.id}`}
                    className="card p-5 hover:shadow-elevated transition-shadow block"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={startup.name} size="lg" />
                        <div>
                          <h3 className="font-semibold text-neutral-900">{startup.name}</h3>
                          <p className="text-sm text-neutral-500">{startup.location}</p>
                        </div>
                      </div>
                      <Badge variant="stage">{STAGE_LABELS[startup.stage]}</Badge>
                    </div>
                    <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{startup.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="sector">{startup.sector}</Badge>
                      <span className="text-sm font-medium text-primary-500">
                        {formatCurrency(startup.amountSought ?? 0)} raised
                      </span>
                    </div>
                  </Link>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Investors */}
      <section className="py-16">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">Featured investors</h2>
            <Link href="/investors" className="btn-tertiary btn-sm">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {mockInvestors.map((investor, i) => (
              <motion.div
                key={investor.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <TiltCard>
                  <Link
                    href={`/investors/${investor.id}`}
                    className="card p-5 hover:shadow-elevated transition-shadow block"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={investor.bio?.split(' ')[0] ?? 'Investor'} size="lg" />
                        <div>
                          <h3 className="font-semibold text-neutral-900">
                            {investor.bio?.split(' ').slice(0, 2).join(' ') ?? 'Investor'}
                          </h3>
                          <p className="text-sm text-neutral-500">{investor.location}</p>
                        </div>
                      </div>
                      <Badge variant="verified">✓ Verified</Badge>
                    </div>
                    <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{investor.bio}</p>
                    <div className="flex flex-wrap gap-2">
                      {investor.preferences?.sectors.slice(0, 3).map((sector) => (
                        <Badge key={sector} variant="sector">
                          {sector}
                        </Badge>
                      ))}
                    </div>
                  </Link>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: 'Trusted profiles',
                desc: 'Verification badges and structured profiles build confidence in every connection.',
                color: 'text-success-500',
              },
              {
                icon: TrendingUp,
                title: 'Explainable matching',
                desc: 'See exactly why a match works — sector, stage, ticket size and geography.',
                color: 'text-primary-500',
              },
              {
                icon: Users,
                title: 'Controlled connections',
                desc: 'Private messaging only after both sides accept a connection request.',
                color: 'text-secondary-500',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <item.icon className={`h-10 w-10 mx-auto ${item.color} mb-3`} />
                <h3 className="font-semibold text-neutral-900 mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-neutral-900 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="relative"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Rocket className="h-12 w-12 mx-auto text-primary-400 mb-4" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-4 relative">Ready to find your match?</h2>
            <p className="text-neutral-300 mb-8 max-w-xl mx-auto relative">
              Join FundrHub today and start building meaningful connections with founders and
              investors who share your vision.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
              <Link href="/register" className="btn-primary btn-lg">
                Create your profile
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/login" className="btn-secondary btn-lg">
                Login
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}