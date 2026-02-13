# Ta'azur Industrial Platform (تآزر)

## Overview
Ta'azur (تآزر) is an industrial synergy platform connecting Saudi SME factories for group buying and capacity exchange. Built with Next.js 16, React 19, TypeScript, and Supabase.

## Recent Changes
- **2026-02-13**: Bank transfer payment system
  - New /bank-transfer page with bank info display and receipt upload
  - Supabase Storage bucket (bank-receipts) for receipt images with RLS
  - bank_transfers table with unique constraint (one pending per user)
  - Admin /admin/bank-transfers page with approve/reject functionality
  - Receipt viewer modal in admin panel
  - Auto-activation of factory account on approval
  - Navigation links in user sidebar and admin sidebar

- **2026-02-13**: Unified OTP authentication (no passwords)
  - Replaced password-based login/signup with OTP-only email code flow
  - Registration: name + phone + email → send OTP code → verify → auto-login
  - Login: email → send OTP code → verify → dashboard
  - User metadata (name, phone) stored via Supabase signInWithOtp options.data
  - Removed password fields, forgot-password, and reset-password flows
  - Rate limiting on sendOtp, signUpWithOtp, and verifyOtp
  - Redirect parameter preserved through entire OTP flow
  - Resend with 60-second cooldown and metadata preservation

- **2026-02-11**: Complete bug fix pass before launch
  - Rebranded all UI from "تكامل" (Takamul) to "تآزر" (Ta'azur) across entire codebase
  - Updated button labels: "إنشاء طلب" → "إنشاء طلب خاص", "إنشاء صفقة" → "اقتراح إضافة صفقة"
  - Fixed logout: proper session termination via Supabase signOut, redirect to /login
  - Notifications system: real-time counter, dropdown menu, mark-as-read, notification types
  - Order tracking page (/orders): status filtering, type filtering, stats cards
  - Deal detail view: slide-over panel with pricing tiers, progress, join CTA
  - Real-time deal card updates: state management via React state, cards update after joining
  - Capacity exchange button: "أضف قدراتك الإنتاجية" now opens add-capacity modal
  - Market prices: displayed with fallback handling on dashboard overview

- **2025-02-05**: Production-ready security and admin dashboard
  - Comprehensive RLS policies with admin bypass (migration 006)
  - Fixed incorrect RLS policies that compared auth.uid() with factory_id
  - Helper functions: get_user_factory_id(), is_admin_user(), user_owns_factory()
  - Transactions table for payment readiness (pending, paid, failed, refunded)
  - Admin dashboard enhancements:
    - Live activity feed with real-time monitoring
    - Deal management with stop/cancel functionality
    - Transaction management page
    - Complete audit logging
  - Server Actions using real database queries with proper authorization
  - All admin read functions now have isAdmin() authorization checks
  - Performance indexes for heavy tables

- **2025-01-31**: Major security and stability improvements
  - Removed hardcoded admin emails, implemented database-driven role-based access control
  - Added rate limiting to authentication flows (login, signup, password reset)
  - Improved input validation and sanitization
  - Safe environment variable handling to prevent runtime crashes
  - Created `.env.example` for configuration clarity
  - Added user_roles database migration (005_user_roles.sql)
  - Flattened project structure from nested folders

## Project Architecture

### Directory Structure
```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages (login, register, forgot-password)
│   │   ├── (admin)/           # Admin dashboard (protected)
│   │   ├── (dashboard)/       # User dashboard (protected)
│   │   │   ├── overview/      # Dashboard overview with market prices
│   │   │   ├── group-buying/  # Group buying with deal cards, detail view, join modal
│   │   │   ├── capacity-exchange/ # Capacity exchange with RFQ and add capacity
│   │   │   ├── orders/        # Order tracking with filtering
│   │   │   └── settings/      # User settings
│   │   ├── (marketing)/       # Landing page
│   │   ├── (onboarding)/      # Factory onboarding flow
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── ui/                # Base UI components (Button, Input, Card, Badge, etc.)
│   │   ├── features/          # Feature-specific components (JoinDealModal, RFQModal, etc.)
│   │   ├── layouts/           # Layout components (Header, Sidebar)
│   │   └── providers/         # Context providers (Theme)
│   ├── lib/
│   │   ├── supabase/          # Supabase client configuration
│   │   ├── actions/           # Server actions (auth, admin, procurement, onboarding)
│   │   ├── config/            # Environment configuration
│   │   ├── rate-limit.ts      # Rate limiting utility
│   │   └── utils.ts           # Shared utilities (cn, formatCurrency, formatNumber)
│   └── types/                 # TypeScript type definitions
├── supabase/
│   └── migrations/            # Database migrations (001-006)
└── public/                    # Static assets
```

### Design System
- Liquid Glass design with neutral color palette
- Arabic RTL support with Cairo/Tajawal fonts
- Dark mode support via next-themes
- Framer Motion animations
- Tailwind CSS v4

### Key Components
- **Header**: Notifications dropdown, user menu with logout, breadcrumb navigation
- **Sidebar**: Navigation with liquid glass styling, collapsible
- **ProcurementDealCard**: Deal cards with pricing tiers, progress bar, join/view actions
- **JoinDealModal**: Multi-step modal (quantity, delivery, commitment, review)
- **RFQModal**: Request for quote modal for capacity exchange
- **SmartAggregator**: AI-powered deal suggestions

### Authentication
- Supabase Auth with OTP (email code, no passwords)
- Login: email → OTP code → verify → dashboard
- Registration: name + phone + email → OTP code → verify → auto-login
- Server-side session management
- Role-based access control (admin, super_admin)
- Rate limiting on sendOtp, signUpWithOtp, verifyOtp
- Protected routes via middleware
- Redirect parameter preserved through OTP flow

### Brand Identity
- Name: تآزر (Ta'azur)
- Platform descriptor: منصة تآزر الصناعية
- Color: Emerald/green primary with neutral palette
