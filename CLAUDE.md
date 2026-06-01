# Bean Counter

A consistency tracker for GitHub contributions and Strava activities, built mobile-first following Apple's iOS Human Interface Guidelines.

## Design Standards

**Always adhere to Apple UI standards:**

### Layout & Spacing
- Use 8pt/16pt grid system for spacing
- 44pt minimum tap target size (on mobile)
- Generous whitespace - don't crowd content
- Safe margins on mobile (16pt from edges)

### Typography
- Clean, readable system fonts (SF Pro Display/Text)
- Clear visual hierarchy with weight & size
- Consistent line height and tracking
- Secondary text at reduced opacity (60-70%)

### Components
- Rounded corners (8-12pt radius for cards)
- Subtle shadows for depth separation
- No unnecessary UI elements
- Minimize visual noise

### Interactions
- Smooth, subtle animations (0.15-0.3s)
- Touch feedback via `active` states
- No hover states on touch devices (@media hover: hover)
- Responsive to screen size changes

### Colors
- Semantic color usage (success=green, warning=orange)
- Proper contrast ratios (WCAG AA minimum)
- Light/dark theme support with CSS variables
- Avoid pure black/white, use semantic grays

### Responsive Design
- Mobile-first approach always
- Breakpoints: 640px (mobile), 1024px (tablet), 1280px+ (desktop)
- Scale content appropriately at each breakpoint
- Test extensively on actual mobile devices

## Architecture

- **index.html**: Markup with inline critical CSS
- **script.js**: Logic for heatmap rendering, theme, responsive behavior
- **data/activities.json**: Activity data synced daily
- **sync.py**: Python script for GitHub/Strava data collection

## Mobile First

Always start with mobile design, then enhance for larger screens. Never show desktop-only layouts on mobile.
