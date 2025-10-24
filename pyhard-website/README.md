# PyHard Website

The official website for PyHard - Gasless Subscriptions on Arbitrum. This Next.js application provides comprehensive documentation, interactive demos, and showcases the PyHard ecosystem for vendors, developers, and users.

## 🚀 Key Features

### 📚 Comprehensive Documentation
- **SDK Documentation**: Complete PyHard Vendor SDK documentation
- **API Reference**: Detailed API documentation with examples
- **Integration Guides**: Step-by-step integration guides
- **Code Examples**: Interactive code examples and snippets

### 🎮 Interactive Demo
- **Live Demo**: Interactive demo using the PyHard Vendor SDK
- **Real-time Testing**: Test features in real-time
- **QR Code Generation**: Generate and test QR codes
- **Payment Simulation**: Simulate payment flows

### 🎨 Modern Design
- **Responsive Design**: Optimized for all devices
- **Dark/Light Mode**: Theme switching capability
- **Accessibility**: WCAG compliant design
- **Performance**: Optimized for fast loading

### 🔗 Ecosystem Integration
- **Vendor SDK Integration**: Live integration with PyHard Vendor SDK
- **Wallet Connection**: Reown AppKit integration
- **Blockchain Integration**: Real blockchain interaction
- **Real-time Updates**: Live data updates

## 🏗️ Technical Architecture

### Core Technologies
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **PyHard Vendor SDK**: Local package integration
- **Reown AppKit**: Wallet connection
- **Viem & Wagmi**: Ethereum interaction

### Project Structure
```
pyhard-website/
├── app/
│   ├── page.tsx              # Landing page
│   ├── docs/
│   │   └── page.tsx          # Documentation
│   ├── demo/
│   │   └── page.tsx          # Interactive demo
│   └── layout.tsx            # Root layout
├── components/
│   ├── Navigation.tsx        # Site navigation
│   ├── Hero.tsx              # Hero section
│   ├── Features.tsx          # Features section
│   ├── Footer.tsx            # Site footer
│   └── CodeBlock.tsx         # Code highlighting
└── public/
    └── images/               # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd pyhard-website
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
NEXT_PUBLIC_CHAIN_ID=421614
NEXT_PUBLIC_PYUSD_ADDRESS=0x6c3ea9036406852006290770BEdFcAbA0e23A0e8
NEXT_PUBLIC_PAYMASTER_URL=https://your-paymaster-url.com
```

### Tailwind CSS Configuration
The website uses Tailwind CSS for styling. Configuration is in `tailwind.config.ts`:

```typescript
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0070BA',
        secondary: '#34C759',
      },
    },
  },
  plugins: [],
}
```

## 📱 Pages & Features

### Landing Page (`/`)
- **Hero Section**: Main value proposition and call-to-action
- **Features Section**: Key features and benefits
- **Use Cases**: Real-world use cases and examples
- **Getting Started**: Quick start guide
- **Footer**: Links and additional information

### Documentation (`/docs`)
- **SDK Documentation**: Complete PyHard Vendor SDK documentation
- **API Reference**: Detailed API documentation
- **Integration Guides**: Step-by-step integration guides
- **Code Examples**: Interactive code examples
- **Troubleshooting**: Common issues and solutions

### Interactive Demo (`/demo`)
- **Live Demo**: Interactive demo using PyHard Vendor SDK
- **Wallet Connection**: Connect wallet or enter manual address
- **QR Code Generation**: Generate payment and subscription QR codes
- **Payment Processing**: Process payments in real-time
- **Subscription Management**: Manage subscriptions

## 🎨 Components

### Navigation
- **Responsive Navigation**: Mobile-friendly navigation
- **Active States**: Current page highlighting
- **Smooth Scrolling**: Smooth scroll to sections
- **Accessibility**: Keyboard navigation support

### Hero Section
- **Compelling Headline**: Clear value proposition
- **Call-to-Action**: Primary action buttons
- **Visual Elements**: Engaging visuals and animations
- **Social Proof**: Testimonials and statistics

### Features Section
- **Feature Cards**: Individual feature descriptions
- **Icons**: Visual representation of features
- **Benefits**: Clear benefits and value
- **Interactive Elements**: Hover effects and animations

### Code Block
- **Syntax Highlighting**: Code syntax highlighting
- **Copy Functionality**: Copy code to clipboard
- **Language Support**: Multiple programming languages
- **Interactive Examples**: Live code examples

## 🔄 PyHard Vendor SDK Integration

### Local Package
The website uses the PyHard Vendor SDK as a local package:

```json
{
  "dependencies": {
    "pyhard-vendor-sdk": "^0.2.0"
  }
}
```

### Component Usage
```tsx
import { 
  PyHardProvider,
  WalletConnect,
  SubscriptionQRGenerator,
  SubscriptionList
} from 'pyhard-vendor-sdk';

function DemoPage() {
  return (
    <PyHardProvider>
      <div className="demo-container">
        <WalletConnect />
        <SubscriptionQRGenerator />
        <SubscriptionList vendorAddress="0x..." />
      </div>
    </PyHardProvider>
  );
}
```

### Configuration
```tsx
<PyHardProvider 
  config={{
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
    blockscoutUrl: process.env.NEXT_PUBLIC_BLOCKSCOUT_URL,
    paymasterUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL
  }}
>
  <DemoPage />
</PyHardProvider>
```

## 🎨 Styling & Design

### Tailwind CSS
The website uses Tailwind CSS for styling:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Custom Components
```tsx
// Custom button component
<button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors">
  Get Started
</button>

// Custom card component
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  <h3 className="text-xl font-semibold mb-4">Feature Title</h3>
  <p className="text-gray-600">Feature description...</p>
</div>
```

### Responsive Design
```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>

// Responsive text
<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
  Main Heading
</h1>
```

## 🚀 Deployment

### Production Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Vercel Deployment
1. **Connect to Vercel**: Connect your GitHub repository
2. **Configure Environment**: Set environment variables
3. **Deploy**: Automatic deployment on push

### Environment Variables
Set these in your deployment platform:
- `NEXT_PUBLIC_RPC_URL`: RPC endpoint for blockchain
- `NEXT_PUBLIC_CHAIN_ID`: Chain ID for the network
- `NEXT_PUBLIC_PYUSD_ADDRESS`: PYUSD token contract address
- `NEXT_PUBLIC_PAYMASTER_URL`: Paymaster service URL

## 🧪 Testing

### Local Testing
```bash
# Run development server
npm run dev

# Test all pages
# - Landing page: http://localhost:3000
# - Documentation: http://localhost:3000/docs
# - Demo: http://localhost:3000/demo
```

### Component Testing
```bash
# Test individual components
# - Navigation functionality
# - Wallet connection
# - QR code generation
# - Payment processing
```

## 🔐 Security Features

### Environment Variables
- **Public Variables**: Only public variables in `NEXT_PUBLIC_*`
- **Private Variables**: Keep sensitive data server-side
- **Validation**: Validate environment variables

### Content Security Policy
```typescript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
          }
        ]
      }
    ]
  }
}
```

## 🔮 Future Enhancements

### Planned Features
- **Multi-language Support**: Internationalization
- **Advanced Analytics**: User behavior tracking
- **SEO Optimization**: Enhanced SEO features
- **Performance Monitoring**: Real-time performance metrics

### Content Updates
- **Regular Updates**: Keep documentation current
- **New Examples**: Add new code examples
- **Tutorials**: Step-by-step tutorials
- **Video Content**: Video demonstrations

## 🛠️ Development

### Key Files
- `app/page.tsx`: Landing page
- `app/docs/page.tsx`: Documentation page
- `app/demo/page.tsx`: Interactive demo
- `components/Navigation.tsx`: Site navigation
- `components/Hero.tsx`: Hero section
- `components/Features.tsx`: Features section

### Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues or questions:
1. Check the documentation
2. Verify environment variables
3. Check network connectivity
4. Contact support team

---

**Note**: This website is designed to showcase the PyHard ecosystem. Ensure all demo features work correctly before deploying to production.