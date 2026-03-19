# Frontend Development Standards & Ecosystem Rules

This document outlines the architectural and design standards for building applications within the Enterprise Ecosystem. Adhering to these rules ensures consistency, scalability, and a unified user experience across all modules (HRM, ERP, CRM, etc.).

## 1. Core Tech Stack

- **Framework**: React 18+ (Functional Components, Hooks)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (Utility-first)
- **Icons**: Lucide React
- **Animations**: Framer Motion / Tailwind Transitions
- **Charts**: Recharts
- **Internationalization**: i18next
- **Notifications**: react-hot-toast

## 2. Design System & Theming

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

## 3. Layout Architecture

Every application must utilize the standard `Layout` component to maintain ecosystem consistency.

### Common Header
The header must include:
1. **Breadcrumbs/Title**: Current location context.
2. **Language Switcher**: Support for `vi` and `en`.
3. **App Switcher (Grid)**: Allows users to jump between different ecosystem modules (HRM, ERP, etc.).
4. **Notification Center**: Bell icon with badge.
5. **User Profile**: Quick access to account settings.

### Sidebar Navigation
- **Collapsible**: Must support a collapsed state for more workspace.
- **Grouping**: Navigation items should be grouped (e.g., "Main", "System").
- **Active State**: Use `bg-indigo-50 text-indigo-600` for the active route.

## 4. Component Patterns

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

## 5. Data Visualization (Dashboards)

- **Stat Cards**: Use a consistent grid (1, 2, or 4 columns). Include an icon, label, value, and trend indicator.
- **Charts**: Use `AreaChart` for trends and `PieChart` for distributions.
- **Responsiveness**: All charts must be wrapped in `ResponsiveContainer`.

## 6. Internationalization (i18n)

- All user-facing text must be stored in `/src/locales/`.
- Use the `useTranslation` hook: `const { t } = useTranslation();`.
- Keys should be organized by module: `t('company.title')`, `t('role.permissions')`.

## 7. API & State Management

- **Services**: Logic should be encapsulated in service objects (e.g., `companyService`).
- **Async Handling**: Use `loading` states and try-catch blocks with toast notifications for errors.
- **Status Codes**:
  - `ACTIVE`: Emerald theme.
  - `INACTIVE/LOCKED`: Amber/Red theme.

## 8. Ecosystem Integration

When building a new module:
1. **Register in App Switcher**: Add the new app icon and link to the `Layout` component.
2. **Shared Components**: Reuse `CompanySelect`, `Button`, and `Card` components.
3. **Consistent Routing**: Follow the pattern `/module-name/feature-name`.
