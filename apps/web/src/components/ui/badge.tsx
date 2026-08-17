'use client';

import type { ReactNode } from 'react';

type BadgeVariant = 'verified' | 'pending' | 'suspended' | 'sector' | 'stage' | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  verified: 'badge-verified',
  pending: 'badge-pending',
  suspended: 'badge-suspended',
  sector: 'tag-sector',
  stage: 'tag-stage',
  default: 'tag bg-neutral-100 text-neutral-700',
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return <span className={`${variantClasses[variant]} ${className}`}>{children}</span>;
}