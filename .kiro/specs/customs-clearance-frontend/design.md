# Design Document - CCAS Frontend

## Overview

The CCAS Frontend is a premium, enterprise-grade web application built with Next.js 14, React 18, and TypeScript. The design philosophy emphasizes clarity, efficiency, and delight through thoughtful micro-interactions, smooth animations, and intelligent information architecture.

The application delivers a Fortune 500-quality experience through:
- **Premium Visual Design**: Modern, clean aesthetics with sophisticated color palettes and typography
- **Fluid Animations**: Gesture-based interactions with physics-based motion
- **Responsive Architecture**: Adaptive layouts optimized for all devices
- **Performance First**: Sub-second load times with optimistic UI updates
- **Accessibility**: WCAG 2.1 AA compliant with keyboard and screen reader support

## Architecture

### Technology Stack

#### Core Framework
- **Next.js 14**: App Router with React Server Components
- **React 18**: Concurrent rendering and Suspense
- **TypeScript 5**: Strict type safety
- **Tailwind CSS 3**: Utility-first styling with custom design system

#### UI Component Libraries
- **Ant Design 5**: Enterprise component foundation
- **Radix UI**: Headless accessible primitives
- **Framer Motion**: Advanced animation library
- **React Spring**: Physics-based animations
- **Lottie**: Complex animation playback

#### State Management
- **Zustand**: Lightweight global state
- **TanStack Query (React Query)**: Server state management
- **Jotai**: Atomic state management for complex forms

#### Data Fetching & Real-time
- **Axios**: HTTP client with interceptors
- **Socket.io Client**: WebSocket for real-time updates
- **SWR**: Stale-while-revalidate caching strategy

#### Form Management
- **React Hook Form**: Performant form handling
- **Zod**: Schema validation
- **React Select**: Advanced select components

#### Data Visualization
- **Recharts**: Declarative charts
- **D3.js**: Custom visualizations
- **React Flow**: Workflow diagrams

#### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **Jest & React Testing Library**: Unit testing
- **Playwright**: E2E testing
- **Storybook**: Component documentation

### Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth layout group
│   │   │   ├── login/
│   │   │   └── callback/
│   │   ├── (dashboard)/       # Dashboard layout group
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx       # Role-based dashboard
│   │   │   ├── shipments/
│   │   │   ├── alerts/
│   │   │   ├── metrics/
│   │   │   └── settings/
│   │   ├── layout.tsx         # Root layout
│   │   └── providers.tsx      # Context providers
│   ├── components/
│   │   ├── ui/                # Base UI components
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   ├── Modal/
│   │   │   ├── Toast/
│   │   │   └── ...
│   │   ├── features/          # Feature-specific components
│   │   │   ├── shipments/
│   │   │   ├── workflow/
│   │   │   ├── alerts/
│   │   │   └── dashboard/
│   │   ├── layouts/           # Layout components
│   │   │   ├── AppShell/
│   │   │   ├── Sidebar/
│   │   │   └── Header/
│   │   └── animations/        # Reusable animations
│   ├── lib/
│   │   ├── api/               # API client
│   │   ├── auth/              # Auth0 integration
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Utility functions
│   │   └── constants/         # Constants and configs
│   ├── styles/
│   │   ├── globals.css        # Global styles
│   │   ├── animations.css     # Animation keyframes
│   │   └── themes/            # Theme definitions
│   ├── types/                 # TypeScript types
│   └── store/                 # State management
├── public/
│   ├── animations/            # Lottie files
│   ├── icons/                 # SVG icons
│   └── images/                # Static images
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── .storybook/                # Storybook config
```

## Design System

### Color Palette

#### Primary Colors
```typescript
const colors = {
  primary: {
    50: '#E6F0FF',   // Lightest blue
    100: '#CCE0FF',
    200: '#99C2FF',
    300: '#66A3FF',
    400: '#3385FF',
    500: '#0066FF',  // Brand primary
    600: '#0052CC',
    700: '#003D99',
    800: '#002966',
    900: '#001433',  // Darkest blue
  },
  secondary: {
    50: '#F0F4F8',
    500: '#64748B',  // Neutral gray
    900: '#0F172A',
  },
  success: {
    50: '#ECFDF5',
    500: '#10B981',  // Green
    900: '#064E3B',
  },
  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',  // Amber
    900: '#78350F',
  },
  error: {
    50: '#FEF2F2',
    500: '#EF4444',  // Red
    900: '#7F1D1D',
  },
  info: {
    50: '#EFF6FF',
    500: '#3B82F6',  // Blue
    900: '#1E3A8A',
  },
}
```

#### Semantic Colors
```typescript
const semanticColors = {
  background: {
    light: '#FFFFFF',
    dark: '#0F172A',
  },
  surface: {
    light: '#F8FAFC',
    dark: '#1E293B',
  },
  border: {
    light: '#E2E8F0',
    dark: '#334155',
  },
  text: {
    primary: { light: '#0F172A', dark: '#F1F5F9' },
    secondary: { light: '#64748B', dark: '#94A3B8' },
    disabled: { light: '#CBD5E1', dark: '#475569' },
  },
}
```

### Typography

```typescript
const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
}
```

### Spacing System

```typescript
const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
}
```

### Elevation (Shadows)

```typescript
const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
}
```

### Border Radius

```typescript
const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  base: '0.5rem',  // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  full: '9999px',
}
```

## Animation System

### Motion Principles

1. **Purposeful**: Every animation serves a functional purpose
2. **Natural**: Physics-based easing for realistic motion
3. **Responsive**: Animations respond to user input
4. **Performant**: GPU-accelerated transforms
5. **Respectful**: Honor prefers-reduced-motion

### Timing Functions

```typescript
const easings = {
  // Standard easings
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Custom easings
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
}

const durations = {
  fast: 150,      // Quick feedback
  base: 300,      // Standard transitions
  slow: 500,      // Complex animations
  slower: 800,    // Page transitions
}
```

### Animation Patterns

#### Fade Animations
```typescript
const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' }
  },
}
```

#### Slide Animations
```typescript
const slideVariants = {
  fromRight: {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: 0, opacity: 1 },
  },
  fromLeft: {
    hidden: { x: '-100%', opacity: 0 },
    visible: { x: 0, opacity: 1 },
  },
  fromTop: {
    hidden: { y: '-100%', opacity: 0 },
    visible: { y: 0, opacity: 1 },
  },
  fromBottom: {
    hidden: { y: '100%', opacity: 0 },
    visible: { y: 0, opacity: 1 },
  },
}
```

#### Scale Animations
```typescript
const scaleVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  },
}
```

#### Stagger Animations
```typescript
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}
```

## Component Design

### Button Component

**Variants**: Primary, Secondary, Outline, Ghost, Danger
**Sizes**: Small, Medium, Large
**States**: Default, Hover, Active, Disabled, Loading

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  onClick?: () => void
  children: ReactNode
}
```

**Animations**:
- Hover: Scale 1.02, shadow elevation
- Active: Scale 0.98
- Loading: Spinner with fade-in, button content fade-out
- Success: Checkmark animation with color transition

### Card Component

**Variants**: Default, Elevated, Bordered, Interactive
**Features**: Hover effects, click animations, loading states

```typescript
interface CardProps {
  variant?: 'default' | 'elevated' | 'bordered' | 'interactive'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  loading?: boolean
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
}
```

**Animations**:
- Hover: Elevate with shadow, scale 1.01
- Click: Scale 0.99, ripple effect
- Loading: Skeleton shimmer animation

### Modal Component

**Types**: Dialog, Drawer, Bottom Sheet, Full Screen
**Features**: Backdrop blur, focus trap, escape key handling

```typescript
interface ModalProps {
  open: boolean
  onClose: () => void
  type?: 'dialog' | 'drawer' | 'bottomSheet' | 'fullScreen'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  title?: string
  footer?: ReactNode
  closeOnBackdrop?: boolean
  children: ReactNode
}
```

**Animations**:
- Dialog: Scale up from center with backdrop fade
- Drawer: Slide in from right
- Bottom Sheet: Slide up from bottom
- Exit: Reverse entrance animation

### Toast Notification

**Types**: Success, Error, Warning, Info
**Positions**: Top-right, Top-center, Bottom-right, Bottom-center

```typescript
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: { label: string; onClick: () => void }
  onClose?: () => void
}
```

**Animations**:
- Enter: Slide in from top with bounce
- Exit: Slide out with fade
- Progress bar: Linear countdown
- Icon: Animated SVG (checkmark draw, error shake)


## Page Layouts

### Authentication Pages

#### Login Page
- **Layout**: Centered card on gradient background
- **Elements**: Logo, title, Auth0 login button, footer links
- **Animation**: Card fade-in with scale, background gradient animation
- **Responsive**: Full-screen on mobile, card on desktop

#### Callback Page
- **Layout**: Centered loading spinner
- **Elements**: Animated logo, loading text, progress indicator
- **Animation**: Pulsing logo, rotating spinner

### Dashboard Layout

#### App Shell Structure
```
┌─────────────────────────────────────────┐
│ Header (Sticky)                         │
│ - Logo, Search, Notifications, Profile │
├──────┬──────────────────────────────────┤
│      │                                  │
│ Side │  Main Content Area               │
│ bar  │  - Breadcrumbs                   │
│      │  - Page Title                    │
│ Nav  │  - Content                       │
│      │                                  │
│      │                                  │
└──────┴──────────────────────────────────┘
```

#### Header Component
- **Height**: 64px
- **Elements**: 
  - Logo (left)
  - Global search (center, Cmd+K)
  - Notifications bell with badge
  - User avatar with dropdown
- **Behavior**: Sticky on scroll with shadow
- **Animation**: Slide down on scroll up, hide on scroll down

#### Sidebar Navigation
- **Width**: 280px (expanded), 64px (collapsed)
- **Elements**:
  - Navigation items with icons
  - Active indicator (animated bar)
  - Collapse toggle
  - Role badge
- **Animation**: Smooth width transition, icon rotation
- **Responsive**: Overlay on mobile, permanent on desktop

### Dashboard Home

#### Layout Grid
```
┌─────────────────┬─────────────────┬─────────────────┐
│ Metric Card 1   │ Metric Card 2   │ Metric Card 3   │
├─────────────────┴─────────────────┴─────────────────┤
│ Chart: Clearance Time Trend                         │
├─────────────────┬───────────────────────────────────┤
│ At-Risk         │ Recent Activity                   │
│ Shipments       │ Timeline                          │
│ List            │                                   │
└─────────────────┴───────────────────────────────────┘
```

#### Metric Cards
- **Design**: Elevated cards with icon, value, trend
- **Animation**: Staggered fade-in, number count-up
- **Interaction**: Hover elevation, click navigation
- **Content**:
  - Large number (primary metric)
  - Trend indicator (arrow + percentage)
  - Sparkline chart
  - Comparison text

### Shipment List Page

#### Layout
- **Header**: Title, filters, actions, view toggle
- **Filters**: Collapsible panel with multi-select
- **Table**: Virtualized with sticky header
- **Pagination**: Load more or infinite scroll

#### Table Design
- **Columns**: 
  - Shipment # (link)
  - Principal
  - ETA (with countdown)
  - Status (badge)
  - Progress (bar)
  - Days Post-ETA (color-coded)
  - Actions (dropdown)
- **Row States**: Default, hover, selected, expanded
- **Animation**: Row slide-in, hover elevation

#### Filter Panel
- **Layout**: Slide-out drawer from left
- **Filters**:
  - Status (multi-select)
  - Department (multi-select)
  - Date range (picker)
  - Risk level (slider)
  - Search (text)
- **Actions**: Apply, Reset, Save preset
- **Animation**: Drawer slide, filter chip animations

### Shipment Detail Page

#### Layout Structure
```
┌─────────────────────────────────────────┐
│ Header: Shipment # | Status | Actions  │
├─────────────────────────────────────────┤
│ Tabs: Overview | Workflow | Documents  │
├─────────────────────────────────────────┤
│                                         │
│ Tab Content (Scrollable)                │
│                                         │
└─────────────────────────────────────────┘
```

#### Overview Tab
- **Sections**:
  - Shipment Information (card)
  - Financial Summary (card with calculations)
  - Timeline Summary (progress bar)
  - Recent Activity (list)
- **Layout**: 2-column grid on desktop, stacked on mobile

#### Workflow Tab
- **Design**: Vertical timeline with department sections
- **Step Card**:
  - Step number and name
  - Department badge
  - Assigned users (avatars)
  - Target date vs actual date
  - Status indicator
  - Action button (if actionable)
- **Animation**: Cascading fade-in, expand/collapse

#### Documents Tab
- **Layout**: Grid of document cards
- **Card**: Icon, name, size, upload date, actions
- **Features**: Upload (drag-drop), preview, download
- **Animation**: Grid item fade-in, upload progress

## Interaction Patterns

### Micro-interactions

#### Button Click
1. Scale down to 0.98
2. Ripple effect from click point
3. Scale back to 1.0
4. Execute action

#### Form Input Focus
1. Border color transition
2. Label slide up and scale down
3. Helper text fade in
4. Icon color change

#### Card Hover
1. Elevate with shadow (0 → 8px)
2. Scale to 1.01
3. Border color brighten
4. Cursor change to pointer

#### Toast Notification
1. Slide in from top-right
2. Bounce slightly on arrival
3. Progress bar countdown
4. Slide out on dismiss or timeout

### Gesture Support

#### Mobile Gestures
- **Swipe Right**: Navigate back
- **Swipe Left**: Show actions menu
- **Pull Down**: Refresh content
- **Long Press**: Show context menu
- **Pinch**: Zoom (on charts/images)

#### Desktop Gestures
- **Hover**: Show tooltips, elevate cards
- **Click**: Primary action
- **Right Click**: Context menu
- **Drag**: Reorder items, move cards
- **Scroll**: Infinite load, parallax effects

## Responsive Design

### Breakpoints

```typescript
const breakpoints = {
  xs: '0px',      // Mobile portrait
  sm: '640px',    // Mobile landscape
  md: '768px',    // Tablet portrait
  lg: '1024px',   // Tablet landscape / Small desktop
  xl: '1280px',   // Desktop
  '2xl': '1536px',// Large desktop
}
```

### Layout Adaptations

#### Mobile (< 768px)
- Single column layouts
- Bottom navigation
- Full-width cards
- Stacked forms
- Drawer modals
- Touch-optimized controls

#### Tablet (768px - 1024px)
- 2-column grids
- Collapsible sidebar
- Hybrid navigation
- Responsive tables (horizontal scroll)
- Modal dialogs

#### Desktop (> 1024px)
- Multi-column grids
- Permanent sidebar
- Hover interactions
- Full-featured tables
- Large modals
- Keyboard shortcuts

## Performance Optimization

### Code Splitting
- Route-based splitting
- Component lazy loading
- Dynamic imports for heavy components
- Vendor chunk optimization

### Image Optimization
- Next.js Image component
- WebP format with fallbacks
- Responsive images
- Lazy loading below fold
- Blur placeholder

### Caching Strategy
- API response caching (React Query)
- Static asset caching (Service Worker)
- Optimistic UI updates
- Background revalidation

### Bundle Size
- Tree shaking
- Dead code elimination
- Compression (Gzip/Brotli)
- Target: < 200KB initial JS bundle

## Accessibility

### Keyboard Navigation
- Tab order follows visual flow
- Focus indicators (2px outline)
- Skip to main content link
- Keyboard shortcuts (documented)
- Escape key closes modals

### Screen Reader Support
- Semantic HTML elements
- ARIA labels and roles
- Live regions for dynamic content
- Alt text for images
- Descriptive link text

### Color Contrast
- Text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum
- Focus indicators: 3:1 minimum

### Motion Preferences
```typescript
// Respect prefers-reduced-motion
const shouldReduceMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches

const animationConfig = {
  duration: shouldReduceMotion ? 0 : 300,
  ease: shouldReduceMotion ? 'linear' : 'easeOut',
}
```

## Testing Strategy

### Unit Testing
- Component rendering
- User interactions
- State management
- Utility functions
- Target: 80% coverage

### Integration Testing
- User flows
- API integration
- Form submissions
- Navigation
- Authentication

### E2E Testing
- Critical user journeys
- Cross-browser testing
- Mobile device testing
- Performance testing
- Accessibility testing

### Visual Regression
- Storybook snapshots
- Chromatic visual testing
- Component variations
- Theme variations

## Error Handling

### Error States

#### Network Errors
- Display: Inline error message with retry button
- Animation: Shake animation, error icon
- Action: Automatic retry with exponential backoff

#### Validation Errors
- Display: Inline below field, red border
- Animation: Shake field, fade in message
- Action: Focus on first error field

#### 404 Not Found
- Display: Full-page illustration with message
- Animation: Illustration fade-in
- Action: Navigate home button

#### 500 Server Error
- Display: Full-page error with support contact
- Animation: Error icon bounce
- Action: Refresh page button

### Loading States

#### Skeleton Screens
- Use for initial page loads
- Match layout of actual content
- Shimmer animation
- Fade to real content

#### Spinners
- Use for button actions
- Use for inline loading
- Smooth rotation
- Size matches context

#### Progress Bars
- Use for file uploads
- Use for multi-step processes
- Smooth animation
- Show percentage

## Internationalization (Future)

### Preparation
- Extract all text to translation files
- Use i18n library (next-intl)
- Support RTL layouts
- Date/time localization
- Number formatting
- Currency formatting

## Security Considerations

### Authentication
- Auth0 integration
- JWT token management
- Automatic token refresh
- Secure token storage
- Session timeout

### Authorization
- Role-based access control
- Route protection
- Component-level permissions
- API request authorization

### Data Protection
- HTTPS only
- XSS prevention
- CSRF protection
- Content Security Policy
- Secure headers

## Monitoring & Analytics

### Performance Monitoring
- Core Web Vitals tracking
- Error tracking (Sentry)
- Performance metrics
- User session recording

### User Analytics
- Page views
- User flows
- Feature usage
- Conversion tracking
- A/B testing support
