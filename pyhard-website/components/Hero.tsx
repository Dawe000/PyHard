import React from 'react';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative overflow-hidden pt-8 pb-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-pyhard-blue/20 via-transparent to-pyhard-accent/10 animate-gradient"></div>
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-pyhard-blue/10 border border-pyhard-blue/30 rounded-full px-4 py-2 mb-8">
            <Zap className="w-4 h-4 text-pyhard-accent" />
            <span className="text-sm font-medium text-gray-300">
              Powered by EIP-7702 Delegation
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-space-grotesk font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-pyhard-blue to-pyhard-accent bg-clip-text text-transparent">
              Gasless Subscriptions
            </span>
            <br />
            <span className="text-white">on Arbitrum</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Accept recurring PYUSD payments with <span className="text-pyhard-accent font-semibold">zero gas fees</span> using EIP-7702 delegation
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/docs"
              className="group inline-flex items-center space-x-2 bg-pyhard-blue hover:bg-pyhard-blue/80 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-4 rounded-lg font-semibold transition-all"
            >
              <span>Try Demo</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="text-3xl font-bold text-pyhard-accent mb-2">$0</div>
              <div className="text-gray-400">Gas Fees for Users</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="text-3xl font-bold text-pyhard-blue mb-2">EIP-7702</div>
              <div className="text-gray-400">Delegation Standard</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="text-3xl font-bold text-white mb-2">Arbitrum</div>
              <div className="text-gray-400">Built on Sepolia</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
