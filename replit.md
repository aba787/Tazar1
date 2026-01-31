# Takamul Industrial Platform

## Overview
Takamul (تكامل) is an industrial synergy platform connecting Saudi SME factories for group buying and capacity exchange. Built with Next.js 16, React 19, TypeScript, and Supabase.

## Recent Changes
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
│   │   ├── (marketing)/       # Landing page
│   │   ├── (onboarding)/      # Factory onboarding flow
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── ui/                # Base UI components (Button, Input, Card, etc.)
│   │   ├── features/          # Feature-specific components
│   │   ├── layouts/           # Layout components (Header, Sidebar)
│   │   └── providers/         # Context providers (Theme)
│   ├── lib/
│   │   ├── supabase/          # Supabase client configuration
│   │   ├── actions/           # Server actions (auth, admin, procurement, onboarding)
│   │   ├── config/            # Environment configuration
│   │   └── utils/             # Utility functions
│   ├── hooks/                 # Custom React hooks
│   ├── stores/                # Zustand stores (if any)
│   └── types/                 # TypeScript type definitions
├── supabase/
│   ├── schema.sql             # Main database schema
│   └── migrations/            # Database migrations
├── public/                    # Static assets
└── .env.example               # Environment variables template
```

### Key Technologies
- **Framework**: Next.js 16 with App Router
- **UI**: React 19, Tailwind CSS 4, Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth with SSR cookies
- **Form Handling**: React Hook Form + Zod
- **State**: Zustand (optional)
- **Language**: Arabic (RTL) primary

### Security Features
- Database-driven role-based access control (RBAC)
- Rate limiting on authentication endpoints
- Input validation and sanitization
- Row Level Security (RLS) in Supabase
- Environment variable validation

## Configuration

### Environment Variables
Copy `.env.example` to `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:5000
```

### Database Setup
Run migrations in order:
1. `schema.sql` - Base tables
2. `002_strategic_procurement.sql` - Procurement features
3. `003_factory_onboarding.sql` - Onboarding flow
4. `004_admin_system.sql` - Admin logs and settings
5. `005_user_roles.sql` - Role-based access control

### First Admin Setup
After running migrations, manually insert an admin role:
```sql
INSERT INTO user_roles (user_id, role, is_active)
VALUES ('your-user-uuid', 'super_admin', true);
```

## Development

### Commands
- `npm run dev` - Start development server on port 5000
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

### Coding Conventions
- Use Arabic for user-facing strings
- Follow existing component patterns
- Use server actions for data mutations
- Always validate user input with Zod
- Never expose internal error messages to users

## User Preferences
- RTL layout (Arabic primary language)
- Dark/Light theme support via next-themes
- Clean, professional design aesthetic
