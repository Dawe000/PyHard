import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';

export const runtime = 'edge';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-pyhard-blue to-pyhard-accent rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-white">404</span>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-space-grotesk font-bold text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-400 mb-8 text-lg">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-pyhard-blue to-pyhard-accent hover:from-pyhard-blue/90 hover:to-pyhard-accent/90 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </Link>
          
          <div className="pt-4">
            <Link
              href="/docs"
              className="inline-flex items-center space-x-2 text-gray-400 hover:text-pyhard-blue transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Documentation</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
