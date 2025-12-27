# CCAS Frontend

Enterprise-grade web application for the Customs Clearance Automation System (CCAS), built with Next.js 14, React 18, and TypeScript.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5 (Strict Mode)
- **Styling**: Tailwind CSS 3
- **Code Quality**: ESLint + Prettier

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
├── components/
│   ├── ui/                # Base UI components
│   ├── features/          # Feature-specific components
│   ├── layouts/           # Layout components
│   └── animations/        # Reusable animations
├── lib/
│   ├── api/              # API client
│   ├── auth/             # Authentication
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   └── constants/        # Constants and configs
├── styles/               # Global styles and themes
├── types/                # TypeScript types
├── store/                # State management
└── public/               # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Clean build artifacts

## Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```bash
cp .env.local.example .env.local
```

Required variables:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_AUTH0_DOMAIN` - Auth0 domain
- `NEXT_PUBLIC_AUTH0_CLIENT_ID` - Auth0 client ID

## Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier with Tailwind plugin
- **Linting**: ESLint with Next.js config
- **Imports**: Path aliases configured (@/, @components/, @lib/)

## Path Aliases

- `@/*` - Root directory
- `@components/*` - Components directory
- `@lib/*` - Library directory

## Contributing

1. Follow the TypeScript strict mode guidelines
2. Use Prettier for code formatting
3. Run `npm run lint` before committing
4. Write meaningful commit messages

## License

Proprietary - Al Hashar Group
