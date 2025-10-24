import React from 'react';
import { Zap, DollarSign, Users, Smartphone, Code, Bell } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Gasless Transactions',
    description: 'Users never pay gas fees thanks to EIP-7702 delegation and paymaster sponsorship.',
    color: 'text-pyhard-accent'
  },
  {
    icon: DollarSign,
    title: 'PYUSD Subscriptions',
    description: 'Accept recurring stablecoin payments with customizable intervals and amounts.',
    color: 'text-pyhard-blue'
  },
  {
    icon: Users,
    title: 'Sub-account System',
    description: 'Create child wallets with spending limits for family allowances and budgeting.',
    color: 'text-purple-400'
  },
  {
    icon: Smartphone,
    title: 'Mobile-First Design',
    description: 'Scan QR codes to authorize subscriptions and payments from your mobile device.',
    color: 'text-pink-400'
  },
  {
    icon: Code,
    title: 'Vendor SDK',
    description: 'Easy integration with styled and headless React components for any use case.',
    color: 'text-orange-400'
  },
  {
    icon: Bell,
    title: 'Real-time Detection',
    description: 'Instant payment notifications via Blockscout API polling and event monitoring.',
    color: 'text-green-400'
  }
];

export function Features() {
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-space-grotesk font-bold text-white mb-4">
            Key Features
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to build gasless subscription systems on Arbitrum
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 hover:border-pyhard-blue/50 transition-all duration-300"
              >
                <div className={`w-12 h-12 ${feature.color} bg-current/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
