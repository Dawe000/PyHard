import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PyHardProvider } from 'pyhard-vendor-sdk';
import { headers } from 'next/headers';
import { ConditionalFooter } from "@/components/ConditionalFooter";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "PyHard - Gasless Subscriptions on Arbitrum",
  description: "Accept recurring PYUSD payments with zero gas fees using EIP-7702 delegation. Built on Arbitrum Sepolia.",
  keywords: ["blockchain", "subscriptions", "EIP-7702", "Arbitrum", "PYUSD", "gasless", "web3"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get('cookie');

  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body className="font-sans antialiased bg-gray-900">
        <PyHardProvider cookies={cookies}>
          <Navigation />
          <main>
            {children}
          </main>
          <ConditionalFooter />
        </PyHardProvider>
      </body>
    </html>
  );
}
