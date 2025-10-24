import React from 'react';
import Link from 'next/link';
import { Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-pyhard-dark/50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-white">
                <img 
                  src="/rsz_pyhard.jpg" 
                  alt="PyHard Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-space-grotesk font-bold text-white">
                PyHard
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Gasless subscriptions on Arbitrum using EIP-7702 delegation.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/demo" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Demo
                </Link>
              </li>
              <li>
                <Link href="/docs/getting-started" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Getting Started
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs/components" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Components
                </Link>
              </li>
              <li>
                <Link href="/docs/hooks" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Hooks
                </Link>
              </li>
              <li>
                <Link href="/docs/examples" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Examples
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/Dawe000/PyHard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors text-sm flex items-center space-x-2"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10">
          <p className="text-gray-400 text-sm text-center">
            © {new Date().getFullYear()} PyHard. Built for ETHGlobal Online 2025.
          </p>
        </div>
      </div>
    </footer>
  );
}
