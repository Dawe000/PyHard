# PyHard Website

Official website for PyHard - Gasless Subscriptions on Arbitrum.

## Features

- **Landing Page**: Information about PyHard, features, and use cases
- **Documentation**: Complete SDK documentation with examples
- **Interactive Demo**: Live demo using the PyHard Vendor SDK

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- PyHard Vendor SDK (local package)
- Reown AppKit

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

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

## Development

The website uses the PyHard Vendor SDK as a local package dependency. Any changes to the SDK will be immediately reflected in the website.

## Building for Production

```bash
npm run build
npm start
```

## License

MIT
