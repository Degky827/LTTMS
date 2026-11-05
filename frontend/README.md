# Integrated Lake Tana Eco-Tourism & Booking Marketplace (LTTMS) — Frontend Architecture

Welcome to the **LTTMS Version 2** frontend documentation. This repository contains the Next.js client application designed to power three distinct user experiences within an integrated marketplace architecture:

1. **Tourist Portal** — Curated eco-tourism itineraries, monastery boat tour bookings, payments, and verified reviews.
2. **Vendor Portal** — Captains, local tour operators, lodges, and artisans managing service availability, reservations, and payouts.
3. **Administration Portal** — Comprehensive platform administration, vendor certification, user RBAC management, disputes, and financial commissions.

---

## 1. Technology Stack

- **Framework:** Next.js `14.2.21` (React `18.2.0`, React-DOM `18.2.0`)
- **Language:** TypeScript `5.3.0` with strict type-checking
- **Styling:** Tailwind CSS `3.3.6` with Lake Tana design tokens and Ge'ez typography support
- **State Management:**
  - TanStack React Query (`@tanstack/react-query 5.100.9`) for server-state caching and invalidation
  - React Context for Authentication, Theme, Language, and Toasts
- **Networking:** Axios `1.16.0` with typed wrapper, token rotation lock, and correlation tracking
- **Real-time:** `socket.io-client 4.8.4` for chat, live booking alerts, and administrative announcements
- **Motion & Icons:** `framer-motion 12.40.0`, `react-icons 4.12.0`
- **Testing:** Node.js native test runner (`node:test`, `node:assert/strict`)

---

## 2. Directory & Architecture Structure

The application adopts a feature-driven, modular frontend foundation under `src/`, while maintaining full backward compatibility with existing routes:

```text
frontend/
├── public/                     # Static media, icons, and web manifest
├── locales/                    # Multilingual translation resources
│   ├── en.json                 # English
│   ├── am.json                 # Amharic (አማርኛ)
│   └── fr.json                 # French (Français)
│
├── pages/                      # Next.js route entrypoints
│   ├── _app.tsx                # Unified AppProviders & Layout resolution
│   ├── 404.tsx                 # Not found page
│   ├── unauthorized.tsx        # 401 Authentication Required page
│   ├── forbidden.tsx           # 403 Access Forbidden page
│   ├── index.tsx               # Public landing page
│   ├── tourist/                # Tourist portal routes (index.tsx)
│   ├── vendor/                 # Vendor portal routes (dashboard.tsx, login, register)
│   ├── admin/                  # Admin portal routes (dashboard.tsx)
│   └── ...                     # Preserved routes (services, vendors, booking, etc.)
│
├── src/
│   ├── components/
│   │   ├── ui/                 # Atomic design system components
│   │   │   ├── Button.tsx      # Standard, outline, ghost, accent, danger, loading
│   │   │   ├── Input.tsx       # Text, password, email with validation states
│   │   │   ├── Textarea.tsx    # Multi-line input
│   │   │   ├── Select.tsx      # Dropdown selector
│   │   │   ├── Checkbox.tsx    # Checkbox & switch toggle
│   │   │   ├── Badge.tsx       # Status, role, and verification badges
│   │   │   ├── Avatar.tsx      # User avatar with fallback initials & status dot
│   │   │   ├── Card.tsx        # Card, CardHeader, CardTitle, CardContent, CardFooter
│   │   │   ├── Modal.tsx       # Accessible dialog modal
│   │   │   ├── Dropdown.tsx    # Context and trigger dropdowns
│   │   │   ├── Tabs.tsx        # Underline and pill tabs
│   │   │   ├── Tooltip.tsx     # Hover/focus tooltip
│   │   │   ├── Breadcrumb.tsx  # Navigation breadcrumbs
│   │   │   ├── Pagination.tsx  # Accessible page navigation
│   │   │   ├── DataTable.tsx   # Generic typed table with loading skeletons
│   │   │   ├── Skeleton.tsx    # Content shimmer placeholders
│   │   │   ├── Spinner.tsx     # Animated loading indicator
│   │   │   ├── Alert.tsx       # Inline dismissible banner alerts
│   │   │   ├── SearchInput.tsx # Debounced search bar with clear button
│   │   │   ├── DatePicker.tsx  # Accessible date selector
│   │   │   └── index.ts        # UI component barrel export
│   │   │
│   │   ├── shared/             # Cross-cutting platform components
│   │   │   ├── Logo.tsx        # Lake Tana brand mark (full, compact, dark/light)
│   │   │   ├── ThemeProvider.tsx # Light/dark theme toggle
│   │   │   ├── LanguageSwitcher.tsx # Language selector (en, am, fr)
│   │   │   ├── LoadingScreen.tsx # Branded full-screen loader
│   │   │   ├── EmptyState.tsx  # Zero-state empty views
│   │   │   ├── ErrorState.tsx  # Error recovery container
│   │   │   └── PageHeader.tsx  # Standardized view header
│   │   │
│   │   ├── layouts/            # Layout foundations for the 3 portals + public
│   │   │   ├── PublicLayout.tsx # Main marketplace header, footer, drawer
│   │   │   ├── TouristLayout.tsx # Tourist portal sidebar, navigation, user menu
│   │   │   ├── VendorLayout.tsx  # Vendor portal sidebar, partner status
│   │   │   ├── AdminLayout.tsx   # Admin portal sidebar, system controls
│   │   │   └── index.ts
│   │   │
│   │   └── feedback/           # User feedback & dialogs
│   │       ├── ToastProvider.tsx # Rich stacked toast notifications
│   │       ├── ConfirmDialog.tsx # Action confirmation modal
│   │       └── GlobalErrorBoundary.tsx # Client exception boundary
│   │
│   ├── contexts/               # Identity and state providers
│   │   ├── AuthContext.tsx     # Centralized RBAC identity provider
│   │   └── LanguageContext.tsx # Centralized internationalization provider
│   │
│   ├── providers/
│   │   └── AppProviders.tsx    # Root provider composition
│   │
│   ├── lib/
│   │   ├── api/                # Centralized API communication
│   │   │   ├── client.ts       # Typed ApiClient singleton
│   │   │   ├── endpoints.ts    # REST endpoints mapping
│   │   │   ├── api-error.ts    # ApiError class and normalization
│   │   │   └── interceptors.ts # Bearer token, refresh queue, correlation IDs
│   │   │
│   │   ├── auth/               # Access rules and security
│   │   │   ├── permissions.ts  # Permission constants & role matrix
│   │   │   ├── route-access.ts # Route access checker & dashboard routing
│   │   │   └── ProtectedRoute.tsx # Route-guard wrapper
│   │   │
│   │   └── utils/
│   │       └── cn.ts           # Classnames & Tailwind merge utility
│   │
│   └── types/                  # TypeScript interface contracts
│       ├── user.ts             # User, UserRole, VendorProfile
│       └── api.ts              # ApiResponse, PaginationMeta
│
├── tests/
│   └── unit/                   # Unit test suites (RBAC, API error, components)
│
├── Dockerfile                  # Multi-stage production & dev Dockerfile
├── next.config.js              # Next.js configuration & standalone conditional
├── tailwind.config.js          # Lake Tana brand colors, tokens & fonts
├── tsconfig.json               # Path aliasing `@/*` -> `./src/*`
└── package.json
```

---

## 3. Installation & Getting Started

### Prerequisites

- Node.js `20.x` or higher (verified with Node 20 & Node 25)
- npm `10.x` or higher

### Install Dependencies

```bash
cd frontend
npm install
```

### Configure Environment Variables

Create `.env.local` inside the `frontend/` directory (or use `.env.example` as a template):

```bash
cp .env.example .env.local
```

Configurable options:

```env
# Public REST API URL (Express Modular Monolith backend)
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Real-time WebSocket Server URL
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Application Metadata
NEXT_PUBLIC_APP_NAME=LTTMS
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 4. Development & Build Commands

| Command | Description |
|---|---|
| `npm run dev` | Starts local Next.js development server on `http://localhost:3000` with hot reloading |
| `npm run build` | Compiles optimized production bundle and statically prerenders all pages |
| `npm run start` | Starts production server using compiled `.next` build |
| `npm run lint` | Runs Next.js ESLint validation |
| `npm test` | Runs unit test suites using Node's native test runner (`node:test`) |

---

## 5. Centralized API Client

The frontend communicates with the Express REST API via `apiClient`, located at `@/lib/api/client`:

```typescript
import { apiClient } from '@/lib/api/client'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

// Example GET request with type parameters
const services = await apiClient.get<ServiceListResponse>(API_ENDPOINTS.SERVICES.LIST)

// Example POST request
const booking = await apiClient.post<BookingResponse>(API_ENDPOINTS.BOOKINGS.CREATE, {
  serviceId: '123',
  date: '2026-11-10',
  guests: 2,
})

// Example File Upload
const uploadResult = await apiClient.upload(API_ENDPOINTS.UPLOADS, formData, (progressEvent) => {
  const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
  console.log(`Upload progress: ${percent}%`)
})
```

### Key Client Features

- **Concurrent Refresh Locking:** Multiple simultaneous requests receiving `401 Unauthorized` wait for a single `/auth/refresh` request without redundant network spam or race conditions.
- **Request Tracing:** Automatically attaches `x-correlation-id` and `Accept-Language` headers to all outbound requests.
- **Normalized Errors:** All exceptions are transformed into instances of `ApiError` with HTTP status codes, machine-readable error codes (`ACCOUNT_SUSPENDED`, `SESSION_EXPIRED`), and field validation arrays.

---

## 6. Authentication & Role-Based Access Control (RBAC)

Identity and access control are unified under `@/contexts/AuthContext`.

### Supported User Roles

1. `tourist` — Visitors exploring destinations, booking tours, and reviewing services.
2. `vendor` — Service operators managing listings, booking calendars, and payouts.
3. `support` — Staff managing customer inquiries, booking assistance, and content moderation.
4. `admin` — Platform administrators approving vendors, reviewing finances, and configuring services.
5. `super_admin` — Root administrators with full platform control and role delegation.

### Protecting Components & Routes

To protect a page using role-based guards:

```tsx
import { ProtectedRoute } from '@/lib/auth/ProtectedRoute'
import { TouristLayout } from '@/components/layouts/TouristLayout'

export default function MyTouristPage() {
  return (
    <ProtectedRoute allowedRoles={['tourist', 'admin', 'super_admin']}>
      <TouristLayout title="My Reservations">
        {/* Page content */}
      </TouristLayout>
    </ProtectedRoute>
  )
}
```

To conditionally render UI elements based on granular permissions:

```tsx
import { useAuth, PERMISSIONS } from '@/contexts/AuthContext'

function ActionPanel() {
  const { hasPermission } = useAuth()

  return (
    <div>
      {hasPermission(PERMISSIONS.SERVICES_CREATE) && (
        <Button variant="primary">Create New Tour Listing</Button>
      )}
    </div>
  )
}
```

---

## 7. Design System & Tokens

The platform features a custom palette inspired by Lake Tana's landscape and cultural heritage:

| Token | Hex | Role |
|---|---|---|
| **Deep Lake Green** | `#145B46` | Primary brand color, headers, primary buttons, accents |
| **Lake Teal** | `#1B8A83` | Secondary brand color, active navigation, badges |
| **Warm Gold** | `#D9A441` | Accent color, call-to-actions, rating stars, badges |
| **Background** | `#F8FAF9` | Application canvas background |
| **Surface** | `#FFFFFF` | Card surfaces and input containers |
| **Border** | `#E4EAE6` | Dividers and element boundaries |

### Typography & Language Support

- Full support for Latin, Ethiopian Ge'ez (`Noto Sans Ethiopic`, `Abyssinica SIL`), and French.
- Responsive layout scales with accessible line heights and contrast ratios adhering to WCAG 2.1 AA standards.

---

## 8. Internationalization (i18n)

Languages supported:
- **English** (`en`)
- **Amharic** (`am` — አማርኛ)
- **French** (`fr` — Français)

Usage in components:

```tsx
import { useLanguage } from '@/contexts/LanguageContext'

export function MyComponent() {
  const { t } = useLanguage()

  return <h2>{t('nav.services', 'Explore Services')}</h2>
}
```

---

## 9. Docker Execution

### Production Docker Run

The application is fully integrated into the root `docker-compose.yml`:

```bash
# Start all services (MongoDB + Backend + Frontend)
docker compose up -d --build
```

### Development Docker Run (with Live Reloading)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

Access points:
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:5000/api/v1`
- **Interactive Swagger Documentation:** `http://localhost:5000/api-docs`
- **Database:** `mongodb://localhost:27017`
