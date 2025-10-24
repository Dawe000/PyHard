'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Menu, X, Book, Code, Zap, ExternalLink } from 'lucide-react';

const navigation = [
  {
    name: 'Get Started',
    items: [
      { name: 'Introduction', href: '/docs' },
      { name: 'Installation', href: '/docs/getting-started' },
      { name: 'Quick Start', href: '/docs/getting-started' },
    ]
  },
  {
    name: 'Components',
    items: [
      { name: 'Overview', href: '/docs/components' },
      { name: 'WalletConnect', href: '/docs/components#walletconnect' },
      { name: 'SubscriptionQRGenerator', href: '/docs/components#subscriptionqrgenerator' },
      { name: 'PaymentQRGenerator', href: '/docs/components#paymentqrgenerator' },
      { name: 'SubscriptionList', href: '/docs/components#subscriptionlist' },
      { name: 'PaymentHistory', href: '/docs/components#paymenthistory' },
    ]
  },
  {
    name: 'Hooks',
    items: [
      { name: 'Overview', href: '/docs/hooks' },
      { name: 'useWallet', href: '/docs/hooks#usewallet' },
      { name: 'useSubscriptions', href: '/docs/hooks#usesubscriptions' },
      { name: 'usePaymentHistory', href: '/docs/hooks#usepaymenthistory' },
      { name: 'usePaymentDetection', href: '/docs/hooks#usepaymentdetection' },
    ]
  },
  {
    name: 'API Reference',
    items: [
      { name: 'Overview', href: '/docs/api' },
      { name: 'Types', href: '/docs/api#types' },
      { name: 'Utilities', href: '/docs/api#utilities' },
      { name: 'Configuration', href: '/docs/api#configuration' },
    ]
  },
  {
    name: 'Examples',
    items: [
      { name: 'Basic Integration', href: '/docs/examples#basic-integration' },
      { name: 'Complete Dashboard', href: '/docs/examples#complete-dashboard' },
      { name: 'Custom Styling', href: '/docs/examples#custom-styling' },
      { name: 'Real-time Updates', href: '/docs/examples#real-time-updates' },
      { name: 'Error Handling', href: '/docs/examples#error-handling' },
    ]
  },
  {
    name: 'Application',
    items: [
      { name: 'Overview', href: '/docs/app' },
      { name: 'Architecture', href: '/docs/app#architecture' },
      { name: 'Use Cases', href: '/docs/app#use-cases' },
      { name: 'Getting Started', href: '/docs/app#getting-started' },
    ]
  }
];

interface DocsLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function DocsLayout({ children, title, description }: DocsLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tableOfContents, setTableOfContents] = useState<Array<{ id: string; text: string; level: number }>>([]);
  const pathname = usePathname();

  // Generate table of contents from headings
  useEffect(() => {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const toc = Array.from(headings).map((heading, index) => {
      const id = heading.id || `heading-${index}`;
      if (!heading.id) {
        heading.id = id;
      }
      return {
        id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName.charAt(1))
      };
    });
    setTableOfContents(toc);
  }, [children]);

  const isActive = (href: string) => {
    if (href === '/docs') {
      return pathname === '/docs';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:flex-shrink-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pyhard-blue to-pyhard-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-white font-semibold">PyHard</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {navigation.map((section) => (
                <div key={section.name}>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    {section.name}
                  </h3>
                  <ul className="space-y-1">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                            isActive(item.href)
                              ? 'bg-pyhard-blue/20 text-pyhard-blue border-l-2 border-pyhard-blue'
                              : 'text-gray-300 hover:text-white hover:bg-gray-700'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-gray-700">
            <Link
              href="/demo"
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm">Try Demo</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 lg:px-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden lg:block">
                <nav className="flex space-x-6">
                  <Link href="/" className="text-gray-300 hover:text-white">Home</Link>
                  <Link href="/docs" className="text-gray-300 hover:text-white">Docs</Link>
                  <Link href="/demo" className="text-gray-300 hover:text-white">Demo</Link>
                </nav>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="https://github.com/Dawe000/PyHard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex flex-1 min-h-0">
          {/* Main content area */}
          <main className="flex-1 max-w-4xl mx-auto px-4 py-8 lg:px-8 overflow-y-auto">
            {title && (
              <div className="mb-8">
                <h1 className="text-4xl font-space-grotesk font-bold text-white mb-4">
                  {title}
                </h1>
                {description && (
                  <p className="text-xl text-gray-400">
                    {description}
                  </p>
                )}
              </div>
            )}
            {children}
          </main>

          {/* Table of contents */}
          {tableOfContents.length > 0 && (
            <aside className="hidden xl:block w-64 p-8 flex-shrink-0">
              <div className="sticky top-8">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  On this page
                </h3>
                <nav className="space-y-2">
                  {tableOfContents.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block text-sm transition-colors ${
                        item.level === 1
                          ? 'text-white font-medium'
                          : item.level === 2
                          ? 'text-gray-300 ml-2'
                          : 'text-gray-400 ml-4'
                      } hover:text-pyhard-blue`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
