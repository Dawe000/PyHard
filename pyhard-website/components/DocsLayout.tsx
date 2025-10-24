'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Menu, X, Book, Code, Zap, ExternalLink } from 'lucide-react';
import docsData from '@/data/docs.json';

// Generate navigation dynamically from docs data
const generateNavigation = () => {
  const navigation = [
    {
      name: 'Get Started',
      items: [
        { name: 'Introduction', href: '/docs' },
        { name: 'Getting Started', href: '/docs/getting-started' },
      ]
    }
  ];

  // Add Components section
  const componentItems = [{ name: 'Overview', href: '/docs/components' }];
  
  // Add individual component pages
  console.log('Available keys:', Object.keys(docsData));
  Object.keys(docsData).forEach(key => {
    if (key.startsWith('components/')) {
      console.log('Found component:', key);
      const componentName = key.replace('components/', '');
      // Convert camelCase to readable format
      const readableName = componentName
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
      componentItems.push({
        name: readableName,
        href: `/docs/${key}`
      });
    }
  });
  
  navigation.push({
    name: 'Components',
    items: componentItems
  });

  // Add Hooks section
  const hookItems = [{ name: 'Overview', href: '/docs/hooks' }];
  
  // Add individual hook pages
  Object.keys(docsData).forEach(key => {
    if (key.startsWith('hooks/')) {
      console.log('Found hook:', key);
      const hookName = key.replace('hooks/', '');
      // Convert camelCase to readable format
      const readableName = hookName
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
      hookItems.push({
        name: readableName,
        href: `/docs/${key}`
      });
    }
  });
  
  navigation.push({
    name: 'Hooks',
    items: hookItems
  });

  // Add API Reference section
  const apiItems = [{ name: 'Overview', href: '/docs/api' }];
  
  // Add individual API pages
  Object.keys(docsData).forEach(key => {
    if (key.startsWith('api/')) {
      console.log('Found API:', key);
      const apiName = key.replace('api/', '');
      // Convert camelCase to readable format
      const readableName = apiName
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
      apiItems.push({
        name: readableName,
        href: `/docs/${key}`
      });
    }
  });
  
  navigation.push({
    name: 'API Reference',
    items: apiItems
  });

  // Add Examples section
  const exampleItems = [{ name: 'Overview', href: '/docs/examples' }];
  
  // Add individual example pages
  Object.keys(docsData).forEach(key => {
    if (key.startsWith('examples/')) {
      console.log('Found example:', key);
      const exampleName = key.replace('examples/', '');
      // Convert kebab-case to readable format
      const readableName = exampleName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      exampleItems.push({
        name: readableName,
        href: `/docs/${key}`
      });
    }
  });
  
  navigation.push({
    name: 'Examples',
    items: exampleItems
  });

  return navigation;
};

const navigation = generateNavigation();

interface DocsLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function DocsLayout({ children, title, description }: DocsLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/docs') {
      return pathname === '/docs';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="h-screen bg-gray-900 flex">
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
          <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
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
          <nav className="flex-1 overflow-y-auto p-4 min-h-0">
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
          <div className="p-4 border-t border-gray-700 flex-shrink-0">
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
      <div className="flex-1 flex flex-col min-w-0 h-full">
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
        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* Main content area */}
          <main className="max-w-4xl mx-auto px-4 py-8 lg:px-8">
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
        </div>
      </div>
    </div>
  );
}
