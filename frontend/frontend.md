# Frontend Development Standards & Ecosystem Rules

This document outlines the architectural and design standards for building applications within the Enterprise Ecosystem. Adhering to these rules ensures consistency, scalability, and a unified user experience across all modules (HRM, ERP, CRM, etc.).

## Core Tech Stack

- **Framework**: React 18+ (Functional Components, Hooks)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (Utility-first)
- **Icons**: Lucide React
- **Animations**: Framer Motion / Tailwind Transitions
- **Charts**: Recharts
- **Internationalization**: i18next
- **Notifications**: react-hot-toast

## Design System & Theming

### Colors
- **Primary**: Indigo (`#4f46e5` - `indigo-600`)
- **Success**: Emerald (`#10b981` - `emerald-600`)
- **Warning**: Amber (`#f59e0b` - `amber-500`)
- **Danger**: Red (`#ef4444` - `red-600`)
- **Neutral**: Slate/Gray for text and borders.

### Typography
- **Font Family**: 'Inter', sans-serif.
- **Scale**:
  - Headings: `text-2xl font-bold text-gray-900`
  - Subtitles: `text-sm text-gray-500`
  - Body: `text-sm text-gray-700`
  - Labels: `text-xs font-semibold text-gray-400 uppercase tracking-wider`

### Borders & Shadows
- **Radius**: Default to `rounded-xl` (12px) or `rounded-2xl` (16px) for cards and modals.
- **Shadows**: Use `shadow-sm` for cards and `shadow-lg` for floating elements (modals, dropdowns).
- **Borders**: `border-gray-200` or `border-gray-100` for subtle separation.

## Layout Architecture

Every application must utilize the standard `Layout` component to maintain ecosystem consistency.

### Common Header
The header is the primary navigation and context anchor for the entire ecosystem. It must be consistent across all applications (HRM, ERP, CRM, etc.).

#### 1. Layout & Styling
- **Height**: Fixed at `h-16` (64px).
- **Background**: `bg-white/80` with `backdrop-blur-md` for a modern, glass-morphism effect.
- **Border**: Bottom border `border-b border-slate-200/60`.
- **Position**: `sticky top-0 z-40 w-full`.
- **Padding**: `px-4 sm:px-6 lg:px-8`.

#### 2. Left Section (Context)
- **Logo/Brand**: Display the Ecosystem Logo or the specific App Logo (e.g., NexusHRM).
- **Breadcrumbs**: Use `text-slate-400` for parent links and `text-slate-900 font-semibold` for the current page. Separate with `ChevronRight` icon.
- **Mobile Toggle**: A `Menu` icon (Lucide) to toggle the sidebar on mobile devices.

#### 3. Right Section (Actions & Profile)
- **Search Bar**: A collapsed search icon or a subtle input field `bg-slate-100 rounded-xl px-3 py-1.5 text-sm`.
- **Language Switcher**: 
  - Dropdown or toggle for `VI` and `EN`.
  - Use `text-xs font-bold` for labels.
  - Active state: `text-indigo-600 bg-indigo-50`.
- **Notification Center**: 
  - `Bell` icon with a red dot badge `bg-rose-500` if there are unread alerts.
  - Hover state: `bg-slate-50`.
- **App Switcher (Grid)**: 
  - A `Grid` or `LayoutGrid` icon.
  - Opens a popover/dropdown showing all available ecosystem modules (HRM, ERP, CRM, Finance, etc.).
  - Each app item should have an icon, name, and hover effect `hover:bg-indigo-50`.
- **User Profile**: 
  - Avatar (image or initials) with `rounded-full`.
  - Displays user name and role on hover or click.
  - Includes "Logout" and "Settings" actions.

#### 4. Interactive States
- All header buttons should use `p-2 rounded-xl transition-all duration-200 hover:bg-slate-100 active:scale-95`.
- Dropdowns must use `AnimatePresence` from `motion/react` for smooth entrance/exit.

### Sidebar Navigation
- **Collapsible**: Must support a collapsed state for more workspace.
- **Grouping**: Navigation items should be grouped (e.g., "Main", "System").
- **Active State**: Use `bg-indigo-50 text-indigo-600` for the active route.

## Component Patterns

### Data Tables
- **Header**: Sticky header with light gray background (`bg-gray-50`).
- **Rows**: Hover effect (`hover:bg-gray-50`) and subtle transitions.
- **Actions**: Right-aligned buttons with clear icons.
- **Empty State**: Centered illustration or text when no data is available.

### Modals & Dialogs
- **Overlay**: `bg-black/50` with backdrop blur if possible.
- **Animation**: Entrance animation (fade-in, zoom-in).
- **Z-index**: Standardized z-index layers (e.g., Modals at 50, Toasts at 100).

### Forms
- **Input Style**: `px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500`.
- **Validation**: Real-time feedback using `react-hot-toast` or inline error messages.
- **Buttons**: Primary action in `indigo-600`, secondary in `gray-100`.

## Data Visualization (Dashboards)

- **Stat Cards**: Use a consistent grid (1, 2, or 4 columns). Include an icon, label, value, and trend indicator.
- **Charts**: Use `AreaChart` for trends and `PieChart` for distributions.
- **Responsiveness**: All charts must be wrapped in `ResponsiveContainer`.

## Internationalization (i18n)

- All user-facing text must be stored in `/src/locales/`.
- Use the `useTranslation` hook: `const { t } = useTranslation();`.
- Keys should be organized by module: `t('company.title')`, `t('role.permissions')`.

## API & State Management

- **Services**: Logic should be encapsulated in service objects (e.g., `companyService`).
- **Async Handling**: Use `loading` states and try-catch blocks with toast notifications for errors.
- **Status Codes**:
  - `ACTIVE`: Emerald theme.
  - `INACTIVE/LOCKED`: Amber/Red theme.

## Ecosystem Integration

When building a new module:
1. **Register in App Switcher**: Add the new app icon and link to the `Layout` component.
2. **Shared Components**: Reuse `CompanySelect`, `Button`, and `Card` components.
3. **Consistent Routing**: Follow the pattern `/module-name/feature-name`.
