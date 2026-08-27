'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Menu, X, Rocket, LogOut, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Avatar } from '@/components/ui/avatar';
import { UserRole } from '@/lib/enums';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isPublic = pathname === '/' || pathname === '/startups' || pathname === '/investors';

  const navLinks = user
    ? user.role === UserRole.FOUNDER
      ? [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/startups', label: 'Discover' },
          { href: '/investors', label: 'Investors' },
          { href: '/matches', label: 'Matches' },
          { href: '/connections', label: 'Requests' },
          { href: '/messages', label: 'Messages' },
        ]
      : user.role === UserRole.ADMIN
        ? [
            { href: '/admin', label: 'Admin Console' },
            { href: '/startups', label: 'Startups' },
            { href: '/investors', label: 'Investors' },
          ]
        : [
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/startups', label: 'Discover' },
            { href: '/matches', label: 'Matches' },
            { href: '/shortlist', label: 'Shortlist' },
            { href: '/connections', label: 'Requests' },
            { href: '/messages', label: 'Messages' },
          ]
    : [
        { href: '/startups', label: 'Explore Startups' },
        { href: '/investors', label: 'Explore Investors' },
      ];

  const profileName =
    user?.founderProfile?.name || user?.email?.split('@')[0] || 'User';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
      <nav className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between" aria-label="Main navigation">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2" aria-label="FundrHub home">
            <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary-500 text-white">
              <Rocket className="h-5 w-5" />
            </span>
            <span className="text-xl font-bold text-neutral-900">FundrHub</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-primary-500 bg-primary-50'
                    : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/notifications"
                className="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </Link>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-neutral-100"
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                >
                  <Avatar name={profileName} size="sm" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-elevated py-1">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="text-sm font-medium text-neutral-900">{profileName}</p>
                      <p className="text-xs text-neutral-500">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <UserIcon className="h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-danger-500 hover:bg-danger-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-tertiary btn-sm">
                Login
              </Link>
              <Link href="/register" className="btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}

          <button
            className="md:hidden p-2 rounded-lg text-neutral-500 hover:bg-neutral-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 py-3">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  pathname === link.href
                    ? 'text-primary-500 bg-primary-50'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}