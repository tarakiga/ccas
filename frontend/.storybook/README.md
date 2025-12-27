# CCAS Frontend Component Library

This Storybook contains documentation and interactive examples for all UI components in the CCAS Frontend application.

## Getting Started

To run Storybook locally:

```bash
npm run storybook
```

This will start Storybook on [http://localhost:6006](http://localhost:6006).

## Component Categories

### UI Components
Base UI components that form the foundation of the design system:
- **Button**: Primary, secondary, outline, ghost, and danger variants
- **Card**: Container component with multiple variants
- **Input**: Text input with floating labels and validation
- **Select**: Dropdown select component
- **Checkbox**: Checkbox input with label
- **Switch**: Toggle switch component
- **Badge**: Status and label badges with pulse animation
- **Avatar**: User avatar with status indicator
- **Tooltip**: Contextual tooltips with smart positioning
- **Modal**: Dialog and modal overlays
- **Toast**: Notification toasts
- **Alert**: Inline alert messages
- **Loading**: Loading spinners and skeletons
- **Progress**: Progress bars
- **Breadcrumbs**: Navigation breadcrumbs
- **Tabs**: Tabbed navigation
- **Pagination**: Page navigation
- **Dropdown**: Dropdown menus
- **Empty**: Empty state component
- **StatCard**: Metric display cards with animations

### Animation Components
Components with built-in animations:
- **PageTransition**: Page-level transitions
- **FadeIn**: Fade-in animations
- **SlideIn**: Slide-in animations from any direction
- **StaggerChildren**: Staggered child animations
- **ScrollReveal**: Scroll-triggered animations
- **AnimatedButton**: Button with micro-interactions
- **AnimatedCard**: Card with hover effects
- **AnimatedInput**: Input with focus animations
- **AnimatedModal**: Modal with scale animations
- **LottieAnimation**: Lottie animation player

## Design Tokens

### Colors
- **Primary**: #0066FF (Blue)
- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Amber)
- **Error**: #EF4444 (Red)
- **Info**: #3B82F6 (Blue)

### Typography
- **Font Family**: Inter (sans-serif)
- **Font Sizes**: xs (12px), sm (14px), base (16px), lg (18px), xl (20px)

### Spacing
Based on 4px grid system (1 = 4px, 2 = 8px, 3 = 12px, etc.)

### Animations
- **Duration**: fast (150ms), base (300ms), slow (500ms)
- **Easing**: easeIn, easeOut, easeInOut, spring, bounce

## Accessibility

All components are built with accessibility in mind:
- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader friendly
- ARIA attributes
- Focus indicators
- Reduced motion support

## Usage Examples

Each component story includes:
- Interactive controls to modify props
- Multiple variants and states
- Accessibility notes
- Code examples

## Contributing

When adding new components:
1. Create the component in `components/ui/` or `components/animations/`
2. Add TypeScript types and props documentation
3. Create a `.stories.tsx` file with examples
4. Document accessibility considerations
5. Add to the barrel export in `index.ts`

## Resources

- [Storybook Documentation](https://storybook.js.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Ant Design](https://ant.design/)
