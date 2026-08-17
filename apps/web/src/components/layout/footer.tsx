import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 mt-auto">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Image src="/logo.png" alt="FundrHub" width={24} height={24} className="rounded-md object-contain" />
              <span className="font-bold text-neutral-900">FundrHub</span>
            </div>
            <p className="text-sm text-neutral-500 max-w-xs">
              Where founders meet their investors. Structured discovery, explainable matching and
              trusted connections.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-neutral-900 mb-3">Platform</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/startups" className="text-sm text-neutral-500 hover:text-primary-500">
                    Explore Startups
                  </Link>
                </li>
                <li>
                  <Link href="/investors" className="text-sm text-neutral-500 hover:text-primary-500">
                    Explore Investors
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-sm text-neutral-500 hover:text-primary-500">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-900 mb-3">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-sm text-neutral-500 hover:text-primary-500">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="text-sm text-neutral-500 hover:text-primary-500">
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-neutral-500 hover:text-primary-500">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/coming-soon" className="text-sm text-neutral-500 hover:text-primary-500">
                    Coming Soon
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-400">
            © {new Date().getFullYear()} FundrHub. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-xs text-neutral-400 hover:text-neutral-600">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs text-neutral-400 hover:text-neutral-600">
              Privacy
            </Link>
            <Link href="/disclaimer" className="text-xs text-neutral-400 hover:text-neutral-600">
              Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}