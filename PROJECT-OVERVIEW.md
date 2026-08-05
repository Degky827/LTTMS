# LTTMS — Project Overview

Lake Tana Tourism Management System — a full-stack platform connecting tourists, local vendors (boat operators, hotels, restaurants, guides), and platform administrators around Lake Tana, Ethiopia.

---

## 1. Technology Stack

### Monorepo Root
| Tool | Purpose |
|------|---------|
| **concurrently** | Run frontend + backend dev servers from a single `npm run dev` command |

### Frontend — `frontend/`

| Technology | Purpose |
|------------|---------|
| **Next.js 14** (Pages Router) | SSR/SSG React framework — file-based routing under `pages/` |
| **React 18** | UI component library |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS 3** | Utility-first CSS with custom theme (primary `#0EA5E9`, secondary `#10B981`) |
| **React Query** | Server-state management (caching, refetching) |
| **Axios** | HTTP client for backend API calls |
| **Framer Motion** | Page transitions and animations |
| **react-icons** | Icon library |
| **ESLint** (next config) | Linting |

### Backend — `backend/`

| Technology | Purpose |
|------------|---------|
| **Node.js / Express.js** | REST API server |
| **MongoDB + Mongoose** | NoSQL database + ODM |
| **Zod** | Request body validation schemas |
| **jsonwebtoken + bcryptjs** | JWT auth + password hashing |
| **helmet** | HTTP security headers |
| **cors** | Cross-origin resource sharing |
| **cookie-parser** | Cookie-based token handling |
| **express-rate-limit** | Rate limiting / brute-force protection |
| **multer** | File upload handling |
| **nodemailer** | Email sending (verification, password reset) |
| **otplib** | OTP/token generation |
| **pino + pino-http** | Structured logging |
| **node-cache** | In-memory caching |
| **Jest + Supertest** | Testing |
| **nodemon** | Dev auto-restart |

---

## 2. Folder Structure

```
LTTMS/
├── package.json              # Root workspace — orchestration scripts
├── render.yaml               # Render.com deployment blueprint
├── .github/                  # GitHub Actions workflows
│
├── frontend/                 # ─── Next.js 14 application ───
│   ├── pages/                # File-based routes
│   │   ├── _app.tsx          #   Global app wrapper (providers)
│   │   ├── index.tsx         #   Home / landing page
│   │   ├── about.tsx         #   About Lake Tana
│   │   ├── services.tsx      #   Browse tourism services
│   │   ├── booking.tsx       #   Booking page
│   │   ├── booking/[id].tsx  #   Single booking detail
│   │   ├── reviews.tsx       #   Reviews & ratings
│   │   ├── vendors.tsx       #   Browse vendors
│   │   ├── eco-tourism.tsx   #   Eco-tourism info
│   │   ├── history.tsx       #   Booking history (tourist)
│   │   ├── contact.tsx       #   Contact form
│   │   ├── login.tsx         #   Tourist login
│   │   ├── register.tsx      #   Tourist registration
│   │   ├── forgot-password.tsx
│   │   ├── reset-password/[token].tsx
│   │   ├── verify-email/[token].tsx
│   │   ├── 404.tsx           #   Custom 404
│   │   ├── admin/
│   │   │   └── dashboard.tsx  #   Admin dashboard
│   │   ├── vendor/
│   │   │   ├── register.tsx   #   Vendor registration
│   │   │   ├── login.tsx      #   Vendor login
│   │   │   └── dashboard.tsx  #   Vendor dashboard
│   │   └── tourist/           #   (tourist-specific pages)
│   │
│   ├── components/           # Reusable React components
│   │   ├── Layout.tsx         #   Global layout shell
│   │   ├── Navbar.tsx         #   Main navigation bar
│   │   ├── PublicNavbar.tsx   #   Public/unauthenticated nav
│   │   ├── Footer.tsx         #   Site footer
│   │   ├── PageTransition.tsx #   Framer Motion page wrapper
│   │   ├── Chat.tsx           #   Chat/messaging widget
│   │   └── ErrorBoundary.tsx  #   React error boundary
│   │
│   ├── context/              # React Context providers
│   │   ├── AuthContext.tsx    #   Auth state + JWT handling
│   │   ├── LanguageContext.tsx#   i18n (EN / AM)
│   │   └── ToastContext.tsx   #   Toast notification state
│   │
│   ├── locales/              # i18n translation files
│   │   ├── en.json            #   English
│   │   └── am.json            #   Amharic
│   │
│   ├── data/                 # Static data
│   │   └── lakeTanaHistory.ts #   Historical content
│   │
│   ├── utils/                # Utility modules
│   │   └── api.js             #   Axios instance + interceptors
│   │
│   ├── styles/
│   │   └── globals.css        #   Global Tailwind imports + custom styles
│   │
│   ├── public/               # Static assets
│   │   ├── icons/             #   SVG/PNG icons
│   │   ├── images/            #   Site images
│   │   ├── manifest.json      #   PWA manifest
│   │   └── sw.js              #   Service Worker (PWA)
│   │
│   ├── tailwind.config.js    # Tailwind theme customization
│   ├── next.config.js        # Next.js configuration
│   ├── postcss.config.js     # PostCSS config
│   ├── tsconfig.json         # TypeScript config
│   └── .eslintrc.json        # ESLint config
│
└── backend/                  # ─── Express.js REST API ───
    ├── index.js              # App entry — Express setup, middleware, routes
    ├── seed.js               # Database seeder script
    │
    ├── routes/               # Route definitions (thin — delegates to controllers)
    │   ├── auth.js           #   /api/auth/*
    │   ├── services.js       #   /api/services/*
    │   ├── bookings.js       #   /api/bookings/*
    │   ├── vendors.js        #   /api/vendors/*
    │   ├── reviews.js        #   /api/reviews/*
    │   ├── messages.js       #   /api/messages/*
    │   ├── payments.js       #   /api/payments/*
    │   ├── uploads.js        #   /api/uploads/*
    │   └── admin.js          #   /api/admin/*
    │
    ├── controllers/          # Business logic layer
    │   ├── authController.js
    │   ├── serviceController.js
    │   ├── bookingController.js
    │   ├── vendorController.js
    │   ├── reviewController.js
    │   ├── messageController.js
    │   └── adminController.js
    │
    ├── models/               # Mongoose schemas
    │   ├── User.js           #   Tourist / admin accounts
    │   ├── Vendor.js         #   Vendor profiles
    │   ├── Service.js        #   Tourism services
    │   ├── Booking.js        #   Booking transactions
    │   ├── Review.js         #   Customer reviews
    │   └── Message.js        #   User-vendor messages
    │
    ├── middleware/            # Express middleware
    │   ├── auth.js           #   JWT verification middleware
    │   ├── permissions.js    #   Role-based access (tourist/vendor/admin)
    │   ├── validate.js       #   Zod validation runner
    │   ├── errorHandlers.js  #   Global error handler + 404
    │   ├── rateLimiters.js   #   Rate-limiting presets
    │   └── requestContext.js #   Request ID + Pino HTTP logger
    │
    ├── validation/           # Zod schemas per domain
    │   ├── authSchemas.js
    │   ├── bookingSchemas.js
    │   ├── reviewSchemas.js
    │   ├── serviceSchemas.js
    │   └── messageSchemas.js
    │
    ├── utils/                # Helper modules
    │   ├── logger.js         #   Pino logger instance
    │   └── email.js          #   Nodemailer transport
    │
    ├── tests/                # Test suite
    │   └── api.test.js       #   API integration tests
    │
    └── uploads/              # Uploaded file storage directory
```

---

## 3. Page-by-Page Explanation (Navbar Links)

Both `Navbar.tsx` (logged-in) and `PublicNavbar.tsx` (guests) share the same 8 nav links. Below is what each page does and who it serves.

### `/` — Home (Landing Page)
**File:** `pages/index.tsx`
   Serves as the entry point for all visitors. Contains a hero banner with a search bar (destination, check-in/out dates), featured destination cards (Zege Monastery, Blue Nile Falls, Eco Lodge, Bird Watching), a "Why Choose Us" section explaining platform benefits, a top eco-tourism services catalog, community/sustainability highlights, a rotating testimonial carousel, platform-wide stats (500+ travelers, 50+ vendors, 95% satisfaction), and an inline registration form at the bottom. Unauthenticated visitors see CTAs that redirect to `/register`.

### `/services` — Browse Tourism Services
**File:** `pages/services.tsx`
   The main browsing experience. Users can filter by category (Eco Lodges, Boat Tours, Cultural Tours, Nature Walks, Monastery Visits, Adventure Packages), toggle an "Eco-Certified Only" switch, set a price range (min/max + slider), sort by popularity/rating/price, and search by keyword. Results are paginated (8 per page) with a card grid showing service images, ratings, prices, and "Book Now" / "View Details" buttons. Each card has a wishlist heart toggle. Clicking "View Details" opens a modal with itinerary highlights, payment options (Telebirr, CBE Birr, PayPal, Visa/Mastercard), and a "Contact Vendor" button.

### `/vendors` — Vendor Directory
**File:** `pages/vendors.tsx`
   Lists all eco-tourism partners around Lake Tana in a card grid. Each card shows the vendor's business name, eco-certification badge, verification badge, description, location, phone, email, and a "View Services" link. Users can search by name/description and filter by eco-certified only. A top banner invites unregistered vendors to "Access Dashboard".

### `/booking` — My Bookings Dashboard
**File:** `pages/booking.tsx`
   Displays the authenticated user's booking management interface. Shows 4 stat cards (Upcoming, Pending, Completed, Cancelled counts). Tabs switch between booking statuses. Each booking row shows the service thumbnail, title, date, guests, total amount, status badge, and action buttons: View Details, Receipt download, Invoice download, and Request Refund. Includes a search bar and a service-type filter dropdown. A simple calendar view shows dates with booked slots. If unauthenticated, prompts sign-in. Refund requests open a modal with reason selection.

### `/eco-tourism` — Eco-Tourism Hub
**File:** `pages/eco-tourism.tsx`
   A rich multi-section educational and interactive page. Uses a sticky sub-navigation (8 sections): Overview (impact stats + badge tier preview + carbon calculator), Eco-Badges (Bronze/Silver/Gold/Platinum certification tiers + sustainability criteria), Carbon Footprint Tracker (activity selector showing kg CO₂ + eco-score), Community Engagement (handicraft support, cultural events, conservation projects with progress bars), Sustainability Tips (6 actionable tips in cards), Green Vendor Directory (certified partners with badges), My Eco-Dashboard (personal eco-score, stats, badges earned), Volunteer & Donate (donation amount selector + volunteer signup form + active community projects). A sticky bottom bar reminds users "Every booking plants a tree."

### `/reviews` — Reviews & Ratings
**File:** `pages/reviews.tsx`
   Aggregates all traveler feedback. Top section shows the overall average rating, a star distribution bar chart, and category scores (Cleanliness, Eco-Friendliness, Hospitality, Value). Below are individual review cards with the reviewer's avatar, name, "Verified Tourist" badge, star rating, date, review text, category scores, optional vendor replies, and action buttons (Reply, Report, Helpful). Users can filter by service type (Eco Lodge, Boat Tour, Cultural Tour, Nature Walk) and sort by newest/highest/lowest rated. A "Write a Review" button opens a submission modal with a star selector and photo upload. The "Trust & Transparency" section explains the verification and fraud-detection system.

### `/about` — About Lake Tana
**File:** `pages/about.tsx`
   An educational resource about Lake Tana itself. Split into 6 alternating sections: Geography & Location (surface area, length, width, depth, elevation), Hydrology (inflow rivers, Blue Nile outlet, Blue Nile Falls), Islands & Monasteries (21-45 islands, 20+ active monasteries, Tana Qirqos), History & Culture (volcanic formation ~5M years ago, Greek scholars, Portuguese Jesuits, James Bruce expedition), Ecological & Economic Importance (UNESCO Biosphere Reserve since 2015, endemic fish, 300+ bird species), and Tourism Significance. Includes a historical timeline from volcanic formation to UNESCO designation, and a section about the platform itself with mission/vision/values.

### `/contact` — Contact Us
**File:** `pages/contact.tsx`
   A contact form with fields for name, email, subject (Booking, Vendor Support, Eco-Tourism, General Inquiry), and message. Client-side validation with error states and a "Send Another Message" button after submission. Side panel shows contact info (email, phone, address), social media links (Facebook, Twitter, YouTube, LinkedIn, GitHub), and a "Support Options" card with FAQ, Live Chat (Coming Soon), and Vendor Support Portal links. Embedded Google Map shows Bahir Dar location. An "Eco-Friendly Communication" note explains the digital-first / carbon-neutral approach.

### Conditional Nav Links (Logged-in only)
- **Dashboard** — `/admin/dashboard` or `/vendor/dashboard` depending on the user's role. Rendered alongside the user's name and role badge.
- **Logout** — Clears auth state and redirects to home.

---

## 4. Architecture Overview

### Data Flow
```
[Browser] ──HTTP──> Next.js (SSR/CSR) ──Axios──> Express API ──Mongoose──> MongoDB
                                                        │
                                                    [Middleware]
                                                 auth · validate · rate-limit · logger
```

### Route Naming Convention
- `GET /api/services` — list all services
- `POST /api/services` — create a service (vendor only)
- `GET /api/services/:id` — single service detail
- Pattern repeats for `bookings`, `reviews`, `vendors`, `messages`, `admin`, `payments`

### Auth Flow
1. User logs in → server returns JWT (set as HTTP-only cookie + response body)
2. `AuthContext` on the frontend stores user state
3. `auth.js` middleware on protected routes decodes and verifies the JWT
4. `permissions.js` checks role (`tourist` / `vendor` / `admin`)

---

## 5. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Next.js Pages Router** (not App Router) | Stable, mature, simpler file-based routing |
| **MongoDB + Mongoose** | Flexible schema for varied service types (boat tours, hotels, guides) |
| **Zod over Joi** | TypeScript-first, smaller bundle, composable schemas |
| **Pino logger** | Structured JSON logging — production-grade, low overhead |
| **Context API (no Redux)** | App state is simple enough (auth, language, toasts) — avoids boilerplate |
| **Separate vendor/tourist pages** | Clear separation of concerns; different UX flows |
| **i18n via JSON + Context** | Lightweight; English + Amharic support without a heavy library |
| **PWA-ready** | Service worker + manifest for offline-capable installable app |
