'use client';

import { getInitials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  src?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-20 w-20 text-xl',
};

export function Avatar({ name, size = 'md', src, className = '' }: AvatarProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={`avatar ${sizeClasses[size]} ${className}`}
        aria-label={name}
      />
    );
  }

  return (
    <span className={`avatar ${sizeClasses[size]} ${className}`} aria-label={name}>
      {getInitials(name)}
    </span>
  );
}