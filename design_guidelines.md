# MobileSec-MS Design Guidelines

## Design Approach: Design System - Developer Tools Pattern

**Selected Approach**: Professional Developer Dashboard System
**Primary References**: GitHub interface aesthetics, Linear's clean information architecture, Stripe Dashboard's data presentation
**Rationale**: Security analysis tools require maximum clarity, efficient information scanning, and professional trustworthiness. Users are technical professionals who value function over visual flourish.

## Core Design Principles

1. **Information Clarity First**: Every element serves to communicate security data efficiently
2. **Hierarchical Scannability**: Users must quickly identify critical vulnerabilities vs. warnings vs. info
3. **Professional Trust**: Clean, minimal design conveys reliability and technical competence
4. **Data Density Balance**: Present comprehensive information without overwhelming users

## Typography System

**Font Family**: 
- Primary: Inter or Roboto via Google Fonts (excellent screen readability)
- Monospace: JetBrains Mono or Fira Code for code snippets, file paths, API keys

**Type Scale**:
- Page Headers: text-3xl font-bold (Main dashboard title, report headers)
- Section Headers: text-xl font-semibold (Microservice sections, scan results categories)
- Subsection Headers: text-lg font-medium (Individual vulnerability types, metadata sections)
- Body Text: text-base (Descriptions, recommendations, general content)
- Labels/Captions: text-sm font-medium (Form labels, table headers, status badges)
- Detail Text: text-xs (Timestamps, metadata, supplementary info)
- Code/Technical: text-sm font-mono (File paths, permissions, API endpoints)

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, and 8 for consistency
- Component padding: p-4 or p-6
- Section spacing: space-y-6 or space-y-8
- Card padding: p-6
- Button padding: px-4 py-2
- Input padding: px-4 py-2
- Tight spacing: gap-2
- Standard spacing: gap-4
- Loose spacing: gap-8

**Container Strategy**:
- Max width: max-w-7xl mx-auto for main content
- Dashboard grid: Full-width with inner constraints
- Report sections: max-w-6xl for optimal readability

**Grid Structure**:
- Dashboard: 12-column grid system
- Stats overview: 4-column grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Vulnerability cards: 2-column (grid-cols-1 lg:grid-cols-2)
- Detailed reports: Single column with nested two-column sections where appropriate

## Component Library

### Navigation & Layout

**Top Navigation Bar**:
- Fixed header with logo left, navigation center, user actions right
- Height: h-16
- Contains: Logo, "Dashboard", "Scans", "Reports", "Integration", "Documentation" links
- Right side: Notification bell icon, user avatar dropdown

**Sidebar** (Dashboard view):
- Width: w-64 on desktop, collapsible on mobile
- Sticky positioning
- Contains: Quick stats summary, recent scans list, quick actions
- Each item: py-2 px-4 with icon + text layout

### Core Components

**File Upload Zone**:
- Large dropzone area: min-h-64 with dashed border (border-2 border-dashed)
- Centered icon (upload cloud icon), heading, and supporting text
- "Click to browse" button below
- Shows file preview after selection with filename, size, and remove option
- Active/hover states with subtle border emphasis

**Scan Progress Card**:
- Real-time progress indicator showing each microservice stage
- Vertical stepper layout (APKScanner → SecretHunter → CryptoCheck → NetworkInspector → ReportGen)
- Each step shows: Icon, service name, status (pending/running/complete/error)
- Progress bar showing overall completion percentage
- Estimated time remaining display

**Vulnerability Cards**:
- Structured card layout: p-6 rounded-lg border
- Header: Severity badge + Vulnerability type + CWE reference
- Body: Description, affected components, file locations (in monospace)
- Footer: Fix suggestion with code snippet in expandable section
- Severity badges: Small pill-shaped badges (px-3 py-1 rounded-full text-xs font-semibold)

**Dashboard Stats Grid**:
- Four metric cards showing: Total Scans, Critical Issues, Last Scan, Scan Success Rate
- Each card: p-6, large number display (text-3xl font-bold), label (text-sm), trend indicator icon

**Data Tables**:
- Clean table design with hover states on rows
- Headers: text-xs font-semibold uppercase tracking-wide
- Cells: py-4 px-6
- Alternating row treatment for scannability
- Sortable columns with sort indicators
- Action column (right-aligned) with icon buttons

**Report Summary Panel**:
- Top section: Scan metadata (app name, package, scan date, duration)
- Middle: Severity distribution chart (simple bar visualization)
- List of findings grouped by microservice
- Each finding: Icon, title, severity, count
- Expandable details with file paths and line numbers

**Fix Suggestion Component**:
- Collapsible accordion pattern
- Header: "Recommended Fix" with expand icon
- Content: Before/After code comparison in side-by-side layout
- Code blocks with syntax highlighting simulation (monospace font, subtle background)
- Copy-to-clipboard button for code snippets

### Forms & Inputs

**Form Fields**:
- Label above input: text-sm font-medium mb-2
- Input height: h-10 with px-4 padding
- Border: border rounded
- Focus ring treatment (ring-2 ring-offset-2)
- Helper text below: text-xs

**Buttons**:
- Primary action: px-6 py-2 rounded font-medium
- Secondary action: px-4 py-2 rounded with border
- Icon buttons: Square aspect ratio (w-10 h-10) with centered icon
- Disabled state: reduced opacity (opacity-50) with cursor-not-allowed

**Select Dropdowns**:
- Same height as inputs (h-10)
- Chevron icon right-aligned
- Dropdown menu: rounded-lg shadow-lg with max-h-60 overflow-y-auto

### Data Visualization

**Severity Indicators**:
- Use size, weight, and position to convey importance
- Critical: Larger badges, top of lists
- High/Medium/Low: Progressively smaller visual weight
- Icons: Shield with exclamation, alert triangle, info circle

**Progress Indicators**:
- Linear progress bars: h-2 rounded-full with animated fill
- Circular spinners for loading states
- Step indicators with connecting lines for multi-stage processes

**Status Badges**:
- Small, pill-shaped: rounded-full px-2 py-1 text-xs font-medium
- States: Scanning, Complete, Failed, Queued
- Icon + text combination when space allows

## Page-Specific Layouts

### Dashboard Page
- Top: Welcome header + "New Scan" CTA button (prominent, right-aligned)
- Stats grid (4 cards wide)
- Recent scans table with status, timestamp, vulnerability count
- Quick insights panel (common issues across recent scans)

### Upload/Analysis Page
- Centered layout with max-w-2xl
- Large upload dropzone as hero element
- Optional: Small illustration/icon representing mobile security
- Configuration options below upload (scan depth, microservices to run)
- "Start Analysis" button (prominent)
- After upload: Transition to progress view with real-time updates

### Results/Report Page
- Two-column layout: Sidebar (sticky) with table of contents + Main content area
- Report header: App info, scan summary, overall score/grade
- Sections for each microservice findings
- Each vulnerability: Card layout with expansion for details
- Bottom: Export options (PDF, JSON, SARIF) with download buttons
- "Rescan" and "Share Report" action buttons

### Integration/CI Setup Page
- Step-by-step guide layout
- Code snippet blocks for GitHub Actions, GitLab CI
- Configuration examples with copy buttons
- Visual flow diagram showing CI/CD integration points

## Spacing & Rhythm

**Page Structure**:
- Page top padding: pt-8
- Section spacing: space-y-8
- Card grids: gap-6
- List items: space-y-4

**Component Internal Spacing**:
- Card headers: pb-4 mb-4 with border-b
- Sections within cards: space-y-4
- Form groups: space-y-6
- Button groups: gap-2

## Animations

**Minimal, Purposeful Motion**:
- Page transitions: None (instant navigation)
- Loading states: Subtle pulse on skeleton loaders
- Microservice progress: Smooth fill animation on progress bars (transition-all duration-300)
- Expandable sections: Smooth height transition (transition-height duration-200)
- Hover states: Quick opacity/transform changes (transition-opacity duration-150)
- **No**: Scroll-triggered animations, parallax, decorative motion

## Accessibility Standards

- All interactive elements: Clear focus indicators (ring-2)
- Form inputs: Associated labels, error messages with aria-live
- Icon buttons: aria-label attributes
- Tables: Proper th/td structure, scope attributes
- Status indicators: Combine icons with text (not icons alone)
- Minimum touch targets: 44x44px for mobile interactions
- Keyboard navigation: Tab order follows visual hierarchy, escape to close modals/dropdowns