import React from 'react';
import Link from 'next/link';
import { ArrowRight, Book, Code, Zap, Package } from 'lucide-react';
import { CodeBlock } from '@/components/CodeBlock';
import { DocsLayout } from '@/components/DocsLayout';


export default function DocsPage() {
  const installCode = `npm install pyhard-vendor-sdk`;

  const quickStartCode = `import { 
  PyHardProvider,
  WalletConnect,
  SubscriptionQRGenerator,
  SubscriptionList
} from 'pyhard-vendor-sdk';

function App() {
  return (
    <PyHardProvider>
      <WalletConnect />
      <SubscriptionQRGenerator />
      <SubscriptionList vendorAddress="0x..." />
    </PyHardProvider>
  );
}`;

  const sections = [
    {
      icon: Book,
      title: 'Getting Started',
      description: 'Installation, setup, and your first component',
      href: '/docs/getting-started',
      color: 'text-pyhard-blue'
    },
    {
      icon: Package,
      title: 'Components',
      description: 'Styled and headless component reference',
      href: '/docs/components',
      color: 'text-pyhard-accent'
    },
    {
      icon: Code,
      title: 'Hooks',
      description: 'Custom hooks for wallet, subscriptions, and payments',
      href: '/docs/hooks',
      color: 'text-purple-400'
    },
    {
      icon: Zap,
      title: 'Examples',
      description: 'Complete examples and use cases',
      href: '/docs/examples',
      color: 'text-orange-400'
    }
  ];

  return (
    <DocsLayout title="Documentation" description="Everything you need to integrate PyHard subscriptions into your application">

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Link
                key={index}
                href={section.href}
                className="group bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 hover:border-pyhard-blue/50 transition-all"
              >
                <Icon className={`w-8 h-8 ${section.color} mb-4 group-hover:scale-110 transition-transform`} />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {section.title}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {section.description}
                </p>
                <div className="flex items-center text-pyhard-blue text-sm font-medium">
                  <span>Learn more</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Installation */}
        <div className="mb-16">
          <h2 className="text-3xl font-space-grotesk font-bold text-white mb-6">
            Installation
          </h2>
          <p className="text-gray-400 mb-4">
            Install the PyHard Vendor SDK via npm:
          </p>
          <CodeBlock code={installCode} language="bash" showLineNumbers={false} />
        </div>

        {/* Quick Start */}
        <div className="mb-16">
          <h2 className="text-3xl font-space-grotesk font-bold text-white mb-6">
            Quick Start
          </h2>
          <p className="text-gray-400 mb-4">
            Get started with PyHard in minutes:
          </p>
          <CodeBlock code={quickStartCode} language="typescript" />
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-space-grotesk font-bold text-white mb-6">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                🎨 Styled Components
              </h3>
              <p className="text-gray-400">
                Beautiful, ready-to-use components with Tailwind CSS styling. Drop them into your app and start accepting subscriptions immediately.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                🔧 Headless Components
              </h3>
              <p className="text-gray-400">
                Fully customizable components using render props. Bring your own UI while leveraging PyHard's functionality.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                🔗 Wallet Integration
              </h3>
              <p className="text-gray-400">
                Connect wallets via Reown AppKit or use manual address input. Flexible authentication for any use case.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-3">
                ⚡ Real-time Updates
              </h3>
              <p className="text-gray-400">
                Automatic polling for payment events via Blockscout API. Get instant notifications when payments are executed.
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-br from-pyhard-blue/20 to-pyhard-accent/20 border border-white/10 rounded-lg p-8">
          <h2 className="text-2xl font-space-grotesk font-bold text-white mb-4">
            Ready to Build?
          </h2>
          <p className="text-gray-300 mb-6">
            Start with the getting started guide or jump straight into the interactive demo.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center justify-center space-x-2 bg-pyhard-blue hover:bg-pyhard-blue/80 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              <span>Getting Started</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-lg font-semibold transition-all"
            >
              <span>Try Demo</span>
            </Link>
          </div>
        </div>
    </DocsLayout>
  );
}
