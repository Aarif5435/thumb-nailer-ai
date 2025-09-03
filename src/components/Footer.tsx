'use client';

import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-card text-card-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="text-2xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Thumb-nailer
            </div>
            <p className="text-sm text-muted-foreground">Professional AI for click‑worthy YouTube thumbnails.</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">About</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">How it works</Link></li>
              <li><Link href="#" className="hover:text-foreground">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link 
                  href="mailto:aarif.mohammad0909@gmail.com" 
                  className="hover:text-foreground flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-3">Follow</h4>
            <div className="flex items-center gap-3">
              <Link 
                href="https://x.com/aarif4935" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="X (Twitter)" 
                className="p-2 rounded-lg border border-border hover:bg-accent"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Thumb-nailer. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <Link href="#" className="hover:text-foreground">Terms</Link>
            <span>•</span>
            <Link href="#" className="hover:text-foreground">Privacy</Link>
            <span>•</span>
            <Link href="#" className="hover:text-foreground">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


