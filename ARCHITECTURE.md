# NFCS UNN Portal — Full Architectural & Structural Guide

### For Antigravity IDE · Next.js + Supabase · Vercel Deployment

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Tooling](#2-tech-stack--tooling)
3. [Folder Structure](#3-folder-structure)
4. [Database Schema (Supabase SQL)](#4-database-schema-supabase-sql)
5. [Row-Level Security (RLS) Policies](#5-row-level-security-rls-policies)
6. [Role & Permission Matrix](#6-role--permission-matrix)
7. [Authentication Architecture](#7-authentication-architecture)
8. [Registration Flow](#8-registration-flow)
9. [Legacy Data Migration System](#9-legacy-data-migration-system)
10. [Payment Architecture](#10-payment-architecture)
11. [Feature Module Map](#11-feature-module-map)
12. [API Routes Structure](#12-api-routes-structure)
13. [Middleware & Route Protection](#13-middleware--route-protection)
14. [Environment Variables](#14-environment-variables)
15. [Supabase Storage](#15-supabase-storage)
16. [Email Notification System](#16-email-notification-system)
17. [Bootstrap Build Order](#17-bootstrap-build-order)
18. [Cursor/Antigravity AI Prompting Rules](#18-cursorantigravity-ai-prompting-rules)

---

## 1. PROJECT OVERVIEW

**Organisation:** Nigerian Federation of Catholic Students (NFCS) — University of Nigeria, Nsukka Chapter  
**Product:** Member Management Portal  
**Deployment:** Vercel (Next.js App Router)  
**Database & Auth:** Supabase

### What the portal does

- Registers students and alumni into a unified member database
- Manages dues/levy collection (online via Monnify/OPay + manual by Exco)
- Handles event and meeting management
- Supports organ-based organisation (5 organs)
- Gives Exco role-based control and super-admin full system access
- Migrates legacy manually-registered members from notebooks/dues cards into the system

### The Five NFCS UNN Organs (enum values)

```
gospel_band
evangelical_committee
federation_theater
social_communications_commission
discipline_committee
```

### Four User Roles (enum values)

```
student | alumnus | exco | super_admin
```

---

## 2. TECH STACK & TOOLING

| Layer       | Technology                      | Notes                              |
| ----------- | ------------------------------- | ---------------------------------- |
| Framework   | Next.js 14+ (App Router)        | Server Components + Server Actions |
| Database    | Supabase (PostgreSQL)           | RLS enforced at DB level           |
| Auth        | Supabase Auth                   | Email/password + magic link        |
| Storage     | Supabase Storage                | Passport photos, documents         |
| Payments    | Monnify + OPay                  | Webhook-driven status updates      |
| Email       | Resend + React Email            | Transactional emails               |
| Styling     | Tailwind CSS + your design.json | Utility-first                      |
| Forms       | React Hook Form + Zod           | Validation on client + server      |
| State       | Zustand (minimal)               | Auth state, UI state               |
| Tables      | TanStack Table                  | Member directory, dues table       |
| Deployment  | Vercel                          | CI/CD from GitHub                  |
| Dev Tooling | ESLint, Prettier, Husky         | Code quality                       |

### Package Installation (run once to bootstrap)

```bash
npx create-next-app@latest nfcs-unn-portal --typescript --tailwind --app --src-dir

# Core
npm install @supabase/supabase-js @supabase/ssr

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# UI
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-tabs
npm install @radix-ui/react-dropdown-menu @radix-ui/react-toast
npm install lucide-react clsx tailwind-merge class-variance-authority

# Tables
npm install @tanstack/react-table

# State
npm install zustand

# Email
npm install resend @react-email/components

# File upload
npm install @supabase/storage-js

# Date handling
npm install date-fns

# Dev
npm install -D prettier eslint-config-prettier
```

---

## 3. FOLDER STRUCTURE

```
nfcs-unn-portal/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group (no navbar)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── claim-account/        # Legacy member account claiming
│   │   │   │   └── page.tsx
│   │   │   └── forgot-password/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (portal)/                 # Protected portal route group
│   │   │   ├── layout.tsx            # Sidebar + navbar layout
│   │   │   │
│   │   │   ├── dashboard/            # Role-aware dashboard
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── profile/              # Member's own profile
│   │   │   │   ├── page.tsx
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── dues/                 # Dues & payments
│   │   │   │   ├── page.tsx          # Member: my dues history
│   │   │   │   └── pay/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── events/               # Events module
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── directory/            # Member directory (exco+)
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── announcements/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── admin/                # Exco + Super-admin only
│   │   │       ├── layout.tsx        # Admin sub-layout with admin nav
│   │   │       ├── members/          # Member management
│   │   │       │   ├── page.tsx      # List, filter, search
│   │   │       │   ├── [id]/
│   │   │       │   │   └── page.tsx  # Member detail & actions
│   │   │       │   ├── add/
│   │   │       │   │   └── page.tsx  # Onsite registration form
│   │   │       │   └── migrate/
│   │   │       │       └── page.tsx  # Legacy migration tool
│   │   │       ├── dues/
│   │   │       │   ├── page.tsx      # Dues overview
│   │   │       │   └── record/
│   │   │       │       └── page.tsx  # Manual payment recording
│   │   │       ├── events/
│   │   │       │   ├── page.tsx
│   │   │       │   └── create/
│   │   │       │       └── page.tsx
│   │   │       ├── announcements/
│   │   │       │   └── create/
│   │   │       │       └── page.tsx
│   │   │       └── settings/         # Super-admin only
│   │   │           └── page.tsx
│   │   │
│   │   ├── api/                      # API routes
│   │   │   ├── auth/
│   │   │   │   └── callback/
│   │   │   │       └── route.ts      # Supabase auth callback
│   │   │   ├── payment/
│   │   │   │   ├── webhook/
│   │   │   │   │   └── route.ts      # Monnify/OPay webhook handler
│   │   │   │   └── initiate/
│   │   │   │       └── route.ts      # Payment initiation
│   │   │   ├── upload/
│   │   │   │   └── route.ts          # Photo upload handler
│   │   │   └── migrate/
│   │   │       └── route.ts          # Legacy import endpoint
│   │   │
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing / redirect to login
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                       # Base UI primitives (from design.json)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── table.tsx
│   │   │   ├── avatar.tsx
│   │   │   └── skeleton.tsx
│   │   │
│   │   ├── forms/                    # Form compositions
│   │   │   ├── RegistrationForm.tsx  # Unified member registration form
│   │   │   ├── OnsiteRegistrationForm.tsx # Exco onsite variant
│   │   │   ├── LoginForm.tsx
│   │   │   ├── ManualPaymentForm.tsx
│   │   │   ├── MigrateForm.tsx       # Legacy member entry form
│   │   │   └── EventForm.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx           # Role-aware sidebar nav
│   │   │   ├── Navbar.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── AdminBreadcrumb.tsx
│   │   │
│   │   ├── member/
│   │   │   ├── MemberCard.tsx
│   │   │   ├── MemberTable.tsx
│   │   │   ├── MemberBadge.tsx       # Role/status badge
│   │   │   ├── MemberFilters.tsx
│   │   │   └── StatusUpgradeModal.tsx # Student → Alumnus upgrade
│   │   │
│   │   ├── dues/
│   │   │   ├── DuesCard.tsx          # Individual dues record
│   │   │   ├── DuesTable.tsx
│   │   │   ├── PaymentStatusBadge.tsx
│   │   │   └── PaymentModal.tsx
│   │   │
│   │   ├── events/
│   │   │   ├── EventCard.tsx
│   │   │   └── EventList.tsx
│   │   │
│   │   └── migration/
│   │       ├── MigrationUploader.tsx # CSV bulk import
│   │       ├── MigrationPreview.tsx  # Preview before commit
│   │       └── ClaimAccountForm.tsx  # Legacy member self-claim
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser client
│   │   │   ├── server.ts             # Server client (Server Components)
│   │   │   ├── middleware.ts         # Middleware client
│   │   │   └── admin.ts              # Service role client (migrations, webhooks)
│   │   │
│   │   ├── actions/                  # Next.js Server Actions
│   │   │   ├── auth.actions.ts
│   │   │   ├── member.actions.ts
│   │   │   ├── payment.actions.ts
│   │   │   ├── event.actions.ts
│   │   │   └── migration.actions.ts
│   │   │
│   │   ├── validations/              # Zod schemas
│   │   │   ├── member.schema.ts
│   │   │   ├── payment.schema.ts
│   │   │   ├── event.schema.ts
│   │   │   └── migration.schema.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── cn.ts                 # clsx + tailwind-merge
│   │   │   ├── format.ts             # Date, currency formatters
│   │   │   ├── roles.ts              # Role hierarchy helpers
│   │   │   └── csv.ts                # CSV parsing for migration
│   │   │
│   │   └── constants/
│   │       ├── organs.ts             # Organ enum + display names
│   │       ├── roles.ts              # Role definitions
│   │       └── dues.ts               # Dues types and amounts
│   │
│   ├── hooks/
│   │   ├── useUser.ts                # Current user + role
│   │   ├── useMembers.ts             # Member list with filters
│   │   ├── useDues.ts
│   │   └── useRoleGuard.ts           # Redirect if insufficient role
│   │
│   ├── types/
│   │   ├── database.types.ts         # Auto-generated from Supabase
│   │   ├── member.types.ts
│   │   ├── payment.types.ts
│   │   └── event.types.ts
│   │
│   └── store/
│       └── auth.store.ts             # Zustand auth state
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_storage_buckets.sql
│   │   └── 004_legacy_migration_table.sql
│   ├── seed.sql                      # Seed: organs, initial super-admin
│   └── config.toml
│
├── emails/                           # React Email templates
│   ├── RegistrationConfirmation.tsx
│   ├── ApprovalNotification.tsx
│   ├── DuesReceipt.tsx
│   ├── EventInvitation.tsx
│   └── ClaimAccountInvite.tsx        # For legacy member claiming
│
├── middleware.ts                     # Route protection
├── next.config.ts
├── tailwind.config.ts
├── .env.local
└── .env.example
```

---

## 4. DATABASE SCHEMA (Supabase SQL)

### Run in order in Supabase SQL Editor

```sql
-- ============================================================
-- MIGRATION 001: INITIAL SCHEMA
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy name search

-- ─── ENUMS ─────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM (
  'student',
  'alumnus',
  'exco',
  'super_admin'
);

CREATE TYPE account_status AS ENUM (
  'pending',      -- Self-registered, awaiting approval
  'active',       -- Approved and active
  'suspended',    -- Temporarily suspended
  'legacy'        -- Migrated, not yet claimed
);

CREATE TYPE organ_type AS ENUM (
  'gospel_band',
  'evangelical_committee',
  'federation_theater',
  'social_communications_commission',
  'discipline_committee'
);

CREATE TYPE payment_channel AS ENUM (
  'online',   -- Monnify or OPay
  'manual'    -- Recorded by Exco
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'confirmed',
  'failed',
  'reversed'
);

CREATE TYPE dues_type AS ENUM (
  'membership_levy',
  'annual_dues',
  'special_levy',
  'other'
);

CREATE TYPE migration_source AS ENUM (
  'notebook',     -- From physical register
  'dues_card',    -- From physical dues card
  'csv_import',   -- Bulk CSV upload
  'manual_entry'  -- Typed in one by one
);

-- ─── PROFILES TABLE ────────────────────────────────────────
-- Extends Supabase auth.users

CREATE TABLE profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Core identity
  full_name           TEXT NOT NULL,
  email               TEXT UNIQUE NOT NULL,
  phone               TEXT,
  date_of_birth       DATE,
  address             TEXT,

  -- NFCS-specific
  role                user_role NOT NULL DEFAULT 'student',
  status              account_status NOT NULL DEFAULT 'pending',
  organ               organ_type,
  society             TEXT,                  -- Free text (society within organ)
  parish              TEXT,                  -- Catholic community/parish

  -- Academic
  faculty             TEXT,
  department          TEXT,
  matric_number       TEXT UNIQUE,
  academic_level      TEXT,                  -- e.g. "300 Level", "Graduate"

  -- Media
  passport_photo_url  TEXT,

  -- Migration tracking
  is_legacy           BOOLEAN DEFAULT FALSE,
  legacy_id           UUID,                  -- FK to legacy_members (set after claim)
  claimed_at          TIMESTAMPTZ,

  -- Metadata
  approved_by         UUID REFERENCES profiles(id),
  approved_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── LEGACY MEMBERS TABLE ──────────────────────────────────
-- For pre-portal members migrated from notebooks/dues cards

CREATE TABLE legacy_members (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Whatever data is available (all nullable except full_name)
  full_name           TEXT NOT NULL,
  email               TEXT,
  phone               TEXT,
  date_of_birth       DATE,
  matric_number       TEXT,
  faculty             TEXT,
  department          TEXT,
  academic_level      TEXT,
  organ               organ_type,
  society             TEXT,
  parish              TEXT,
  address             TEXT,

  -- Legacy-specific
  role                user_role NOT NULL DEFAULT 'student',
  migration_source    migration_source NOT NULL,
  migrated_by         UUID,                  -- Exco/admin who imported
  notes               TEXT,                  -- Exco notes about this record

  -- Claim state
  claim_status        TEXT DEFAULT 'unclaimed' CHECK (
                        claim_status IN ('unclaimed', 'invited', 'claimed')
                      ),
  claim_token         TEXT UNIQUE,           -- One-time claim token
  claim_token_expires TIMESTAMPTZ,
  claimed_by_profile  UUID REFERENCES profiles(id),

  -- Historical dues (from dues cards)
  dues_imported       BOOLEAN DEFAULT FALSE,

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PAYMENTS TABLE ────────────────────────────────────────

CREATE TABLE payments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Can belong to a profile OR a legacy member (not yet claimed)
  profile_id          UUID REFERENCES profiles(id),
  legacy_member_id    UUID REFERENCES legacy_members(id),

  -- Payment details
  amount              NUMERIC(10,2) NOT NULL,
  dues_type           dues_type NOT NULL DEFAULT 'membership_levy',
  channel             payment_channel NOT NULL,
  status              payment_status NOT NULL DEFAULT 'pending',

  -- References
  payment_reference   TEXT UNIQUE,           -- Gateway ref or manual ref
  gateway             TEXT,                  -- 'monnify' | 'opay' | 'manual'
  gateway_response    JSONB,                 -- Raw webhook payload

  -- Period tracking (e.g. "2024/2025 session")
  payment_period      TEXT,

  -- Manual payment metadata
  recorded_by         UUID REFERENCES profiles(id),
  receipt_number      TEXT,
  payment_date        DATE,
  notes               TEXT,

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),

  -- At least one of profile_id or legacy_member_id must be set
  CONSTRAINT payment_owner_check CHECK (
    profile_id IS NOT NULL OR legacy_member_id IS NOT NULL
  )
);

-- ─── EVENTS TABLE ──────────────────────────────────────────

CREATE TABLE events (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title               TEXT NOT NULL,
  description         TEXT,
  event_type          TEXT DEFAULT 'general',  -- 'general' | 'organ' | 'meeting'
  organ               organ_type,              -- NULL = all-chapter event
  location            TEXT,
  starts_at           TIMESTAMPTZ NOT NULL,
  ends_at             TIMESTAMPTZ,
  is_published        BOOLEAN DEFAULT FALSE,
  created_by          UUID REFERENCES profiles(id),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ANNOUNCEMENTS TABLE ───────────────────────────────────

CREATE TABLE announcements (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title               TEXT NOT NULL,
  body                TEXT NOT NULL,
  organ               organ_type,              -- NULL = all-chapter
  is_published        BOOLEAN DEFAULT FALSE,
  published_at        TIMESTAMPTZ,
  created_by          UUID REFERENCES profiles(id),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AUDIT LOG ─────────────────────────────────────────────
-- Tracks all sensitive admin actions

CREATE TABLE audit_log (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id            UUID REFERENCES profiles(id),
  action              TEXT NOT NULL,          -- 'approve_member', 'record_payment', etc.
  target_type         TEXT,                   -- 'profile' | 'payment' | 'event'
  target_id           UUID,
  metadata            JSONB,                  -- Before/after snapshots
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES ───────────────────────────────────────────────

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_organ ON profiles(organ);
CREATE INDEX idx_profiles_matric ON profiles(matric_number);
CREATE INDEX idx_profiles_name_trgm ON profiles USING GIN (full_name gin_trgm_ops);
CREATE INDEX idx_payments_profile ON payments(profile_id);
CREATE INDEX idx_payments_legacy ON payments(legacy_member_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_legacy_email ON legacy_members(email);
CREATE INDEX idx_legacy_matric ON legacy_members(matric_number);
CREATE INDEX idx_legacy_claim_token ON legacy_members(claim_token);

-- ─── AUTO-UPDATE updated_at ────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER legacy_members_updated_at
  BEFORE UPDATE ON legacy_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── AUTH TRIGGER ──────────────────────────────────────────
-- Auto-create profile row on Supabase Auth signup

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
    'student',
    'pending'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 5. ROW-LEVEL SECURITY (RLS) POLICIES

```sql
-- ============================================================
-- MIGRATION 002: RLS POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ─── HELPER FUNCTION ───────────────────────────────────────
-- Gets the current user's role safely

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_exco_or_above()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() IN ('exco', 'super_admin')
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT get_user_role() = 'super_admin'
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── PROFILES POLICIES ─────────────────────────────────────

-- Members can read their own profile
CREATE POLICY "profiles_self_read"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Exco+ can read all profiles
CREATE POLICY "profiles_exco_read_all"
  ON profiles FOR SELECT
  USING (is_exco_or_above());

-- Members can update their own profile (restricted fields)
CREATE POLICY "profiles_self_update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    -- Members cannot update role, status, or approval fields themselves
    auth.uid() = id
  );

-- Exco+ can update any profile (for approvals, role upgrades)
CREATE POLICY "profiles_exco_update_all"
  ON profiles FOR UPDATE
  USING (is_exco_or_above());

-- Only super_admin can delete profiles
CREATE POLICY "profiles_super_admin_delete"
  ON profiles FOR DELETE
  USING (is_super_admin());

-- Insert is handled by auth trigger; also allow exco onsite registration
CREATE POLICY "profiles_exco_insert"
  ON profiles FOR INSERT
  WITH CHECK (is_exco_or_above() OR auth.uid() = id);

-- ─── LEGACY MEMBERS POLICIES ───────────────────────────────

-- Only exco+ can see legacy_members list
CREATE POLICY "legacy_exco_read"
  ON legacy_members FOR SELECT
  USING (is_exco_or_above());

-- Anyone can read their own legacy record via claim token (handled in app layer)
-- Exco+ can insert/update/delete legacy records
CREATE POLICY "legacy_exco_write"
  ON legacy_members FOR ALL
  USING (is_exco_or_above());

-- ─── PAYMENTS POLICIES ─────────────────────────────────────

-- Members can see their own payments
CREATE POLICY "payments_self_read"
  ON payments FOR SELECT
  USING (auth.uid() = profile_id);

-- Exco+ can see all payments
CREATE POLICY "payments_exco_read_all"
  ON payments FOR SELECT
  USING (is_exco_or_above());

-- Exco+ can insert payments (manual recording + online via webhook)
CREATE POLICY "payments_exco_insert"
  ON payments FOR INSERT
  WITH CHECK (is_exco_or_above());

-- Exco+ can update payment status
CREATE POLICY "payments_exco_update"
  ON payments FOR UPDATE
  USING (is_exco_or_above());

-- ─── EVENTS POLICIES ───────────────────────────────────────

-- Published events visible to all authenticated users
CREATE POLICY "events_authenticated_read"
  ON events FOR SELECT
  USING (auth.role() = 'authenticated' AND is_published = TRUE);

-- Exco+ can see all events (including drafts)
CREATE POLICY "events_exco_read_all"
  ON events FOR SELECT
  USING (is_exco_or_above());

-- Exco+ can create/edit events
CREATE POLICY "events_exco_write"
  ON events FOR ALL
  USING (is_exco_or_above());

-- ─── ANNOUNCEMENTS POLICIES ────────────────────────────────

CREATE POLICY "announcements_authenticated_read"
  ON announcements FOR SELECT
  USING (auth.role() = 'authenticated' AND is_published = TRUE);

CREATE POLICY "announcements_exco_write"
  ON announcements FOR ALL
  USING (is_exco_or_above());

-- ─── AUDIT LOG POLICIES ────────────────────────────────────

-- Only super_admin can read audit log
CREATE POLICY "audit_super_admin_read"
  ON audit_log FOR SELECT
  USING (is_super_admin());

-- System can insert (via service role in API routes)
-- No user-level insert policy — done via service role only
```

---

## 6. ROLE & PERMISSION MATRIX

| Action                       | Student | Alumnus | Exco | Super Admin |
| ---------------------------- | :-----: | :-----: | :--: | :---------: |
| View own profile             |   ✅    |   ✅    |  ✅  |     ✅      |
| Edit own profile             |   ✅    |   ✅    |  ✅  |     ✅      |
| View member directory        |   ❌    |   ❌    |  ✅  |     ✅      |
| Approve/reject registrations |   ❌    |   ❌    |  ✅  |     ✅      |
| Upgrade student → alumnus    |   ❌    |   ❌    |  ✅  |     ✅      |
| Upgrade any role             |   ❌    |   ❌    |  ❌  |     ✅      |
| Onsite member registration   |   ❌    |   ❌    |  ✅  |     ✅      |
| View own dues                |   ✅    |   ✅    |  ✅  |     ✅      |
| Pay dues online              |   ✅    |   ✅    |  ✅  |     ✅      |
| Record manual payment        |   ❌    |   ❌    |  ✅  |     ✅      |
| View all payments            |   ❌    |   ❌    |  ✅  |     ✅      |
| Create events                |   ❌    |   ❌    |  ✅  |     ✅      |
| Publish events               |   ❌    |   ❌    |  ✅  |     ✅      |
| Send announcements           |   ❌    |   ❌    |  ✅  |     ✅      |
| Migrate legacy members       |   ❌    |   ❌    |  ✅  |     ✅      |
| Suspend accounts             |   ❌    |   ❌    |  ❌  |     ✅      |
| Manage exco accounts         |   ❌    |   ❌    |  ❌  |     ✅      |
| View audit log               |   ❌    |   ❌    |  ❌  |     ✅      |
| System settings              |   ❌    |   ❌    |  ❌  |     ✅      |

---

## 7. AUTHENTICATION ARCHITECTURE

### Supabase Client Setup

```typescript
// src/lib/supabase/client.ts — Browser client
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
```

```typescript
// src/lib/supabase/server.ts — Server Components & Server Actions
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

export const createClient = async () => {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
};
```

```typescript
// src/lib/supabase/admin.ts — Service Role (webhooks, migrations)
// NEVER expose this to the browser — server only
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export const adminClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
```

### Auth Flow Decisions

- **Self-registration**: User fills form → Supabase Auth creates user → trigger creates profile → status = `pending`
- **Exco onsite**: Exco creates auth user via admin client → creates profile with status = `active`
- **Legacy claim (self-serve)**: User visits `/claim-account?token=xxx` → validates token → links to existing Supabase Auth account or creates one → marks legacy record as `claimed`
- **Legacy claim (admin-created)**: Exco creates account manually → sends credentials to member

---

## 8. REGISTRATION FLOW

### Self-Service Flow

```
[/register page]
  → User fills RegistrationForm (all fields)
  → Client-side Zod validation
  → Server Action: registerMember()
      1. Upload passport photo → Supabase Storage
      2. Create Supabase Auth user (email + temp password or magic link)
      3. Update profile with all fields (trigger already created the row)
      4. Send RegistrationConfirmation email via Resend
      5. Return success
  → User sees "Registration submitted, pending approval"

[Exco/Admin dashboard]
  → Sees pending registrations list
  → Opens member detail
  → Clicks Approve or Reject
  → Server Action: approveMember() / rejectMember()
      1. Update profiles.status = 'active' / 'suspended'
      2. Set approved_by + approved_at
      3. Write to audit_log
      4. Send ApprovalNotification email
```

### Onsite Flow (Exco)

```
[/admin/members/add page — Exco only]
  → Exco fills OnsiteRegistrationForm
  → Server Action: onsiteRegisterMember()
      1. Upload passport photo
      2. Create Supabase Auth user via adminClient (bypasses email confirm)
      3. Profile row already created by trigger; update all fields
      4. Set status = 'active' immediately
      5. Set approved_by = exco's ID
      6. Optionally record manual payment at same time
      7. Write to audit_log
      8. Send welcome email to member
```

### Zod Schema (shared between both forms)

```typescript
// src/lib/validations/member.schema.ts

import { z } from "zod";

export const ORGANS = [
  "gospel_band",
  "evangelical_committee",
  "federation_theater",
  "social_communications_commission",
  "discipline_committee",
] as const;

export const memberSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(11, "Valid Nigerian phone number required"),
  date_of_birth: z.string().optional(),
  address: z.string().optional(),
  faculty: z.string().min(1, "Faculty is required"),
  department: z.string().min(1, "Department is required"),
  matric_number: z.string().min(1, "Matric number is required"),
  academic_level: z.string().min(1, "Academic level is required"),
  organ: z.enum(ORGANS, { required_error: "Select an organ" }),
  society: z.string().optional(),
  parish: z.string().optional(),
  passport_photo: z.instanceof(File).optional(),
});

export type MemberFormValues = z.infer<typeof memberSchema>;
```

---

## 9. LEGACY DATA MIGRATION SYSTEM

This is the most nuanced module. It handles members who exist in physical registers and dues cards but have no portal account.

### Three Migration Entry Points

#### A. CSV Bulk Import (for bulk notebook digitisation)

```
[/admin/members/migrate]
  → Exco downloads CSV template
  → Fills CSV with legacy member data (partial data allowed)
  → Uploads CSV
  → MigrationPreview.tsx shows parsed data with validation warnings
      - Yellow warning: missing email (will need manual claim)
      - Red error: duplicate matric number already in profiles
  → Exco confirms import
  → Server Action: bulkMigrateLegacyMembers()
      1. Parse and validate each row
      2. For each valid row: INSERT into legacy_members
      3. For each row with dues history: INSERT into payments
         (with profile_id = NULL, legacy_member_id set)
      4. Return import summary (X imported, Y skipped, Z errors)
```

#### B. Manual Entry (one by one)

```
[/admin/members/migrate — manual tab]
  → Exco fills MigrateForm with whatever data is available
  → Submits → INSERT into legacy_members
  → Optionally records historical dues payments
```

#### C. CSV Template Format

```csv
full_name,email,phone,matric_number,faculty,department,academic_level,organ,society,parish,migration_source,notes,dues_amount_paid,dues_period
"John Doe","john@example.com","08012345678","2019/12345","Engineering","Electrical","Graduate","gospel_band","","St. Peter's","dues_card","Has receipt no. 001","5000","2022/2023"
"Jane Smith","","08098765432","2020/67890","Arts","English","400 Level","federation_theater","Drama Group","St. Mary's","notebook","Incomplete address","","",
```

### Claim Account System

#### Option A — Self-Serve Claim (email known)

```
[Exco generates claim invite for legacy member with email]
  → Server Action: sendClaimInvite(legacyMemberId)
      1. Generate a unique claim_token (UUID)
      2. Set claim_token_expires = NOW() + 7 days
      3. Update legacy_members.claim_status = 'invited'
      4. Send ClaimAccountInvite email with link:
         https://nfcs-unn.vercel.app/claim-account?token={claim_token}

[Member clicks link]
  → /claim-account?token=xxx page loads
  → Server validates token + expiry
  → Shows: "We found your record. Set your password to activate your account."
  → Member sets email + password
  → Server Action: claimLegacyAccount(token, email, password)
      1. Create Supabase Auth user
      2. Insert into profiles with all fields from legacy_members
      3. Move legacy payments to use the new profile_id
      4. Update legacy_members.claim_status = 'claimed'
      5. Update legacy_members.claimed_by_profile = new profile ID
      6. Set profiles.is_legacy = true, legacy_id = legacy_member.id
      7. Set profiles.status = 'active' (pre-approved by nature of migration)
      8. Write to audit_log
```

#### Option B — Admin-Created Account (email unknown or unavailable)

```
[Exco manually creates account]
  → /admin/members/[legacy_id]/create-account page
  → Exco enters or confirms email + temporary password
  → Server Action: createAccountForLegacyMember(legacyMemberId, email, tempPassword)
      1. Create Supabase Auth user via adminClient
      2. Insert into profiles with legacy data
      3. Transfer payments
      4. Mark legacy record as claimed
      5. Give credentials to member manually
```

### Dues Card History Import

Legacy members may have dues cards showing past payments. These are imported into the `payments` table as historical records:

```typescript
// Example: importing dues card history for a legacy member
{
  legacy_member_id: "uuid-of-legacy-record",
  profile_id: null,           // Will be filled when they claim account
  amount: 5000,
  dues_type: "annual_dues",
  channel: "manual",
  status: "confirmed",
  payment_period: "2022/2023",
  payment_reference: "LEGACY-2022-001",
  notes: "Imported from dues card — receipt #001",
  payment_date: "2023-03-15",
  recorded_by: "uuid-of-exco-who-imported"
}
```

When a legacy member claims their account, a database function reassigns all their legacy payments:

```sql
-- Run when a legacy account is claimed
CREATE OR REPLACE FUNCTION claim_legacy_payments(
  p_legacy_id UUID,
  p_profile_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE payments
  SET profile_id = p_profile_id
  WHERE legacy_member_id = p_legacy_id
    AND profile_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 10. PAYMENT ARCHITECTURE

### Online Payment Flow (Monnify / OPay)

```
[Member on /dues/pay]
  → Selects dues type + amount
  → Clicks "Pay Online"
  → Server Action: initiatePayment()
      1. Generate internal reference: NFCS-{UUID}
      2. Create pending payment record in DB
      3. Call Monnify/OPay API to initialise transaction
      4. Return checkout URL
  → Member redirected to payment gateway
  → Gateway processes payment
  → Gateway fires webhook to: POST /api/payment/webhook

[POST /api/payment/webhook]
  → Verify webhook signature (Monnify: HMAC-SHA512, OPay: signature header)
  → Parse payload
  → Find payment record by reference
  → Update status: 'confirmed' or 'failed'
  → If confirmed: send DuesReceipt email
  → Write to audit_log
  → Return 200 OK to gateway
```

### Manual Payment Flow (Exco)

```
[Exco on /admin/dues/record]
  → Selects member from dropdown (searches profiles + legacy_members)
  → Fills ManualPaymentForm:
      - Amount
      - Dues type (enum select)
      - Payment period (e.g. "2024/2025")
      - Receipt number
      - Payment date
      - Notes
  → Server Action: recordManualPayment()
      1. Insert into payments with channel = 'manual', status = 'confirmed'
      2. Set recorded_by = exco's profile ID
      3. Send DuesReceipt email to member
      4. Write to audit_log
```

### Payment Table Component Data Shape

```typescript
type PaymentRecord = {
  id: string;
  member_name: string;
  member_matric: string;
  amount: number;
  dues_type: string;
  channel: "online" | "manual";
  status: "pending" | "confirmed" | "failed";
  payment_period: string;
  payment_reference: string;
  payment_date: string;
  recorded_by_name?: string; // For manual payments
};
```

---

## 11. FEATURE MODULE MAP

### Module 1 — Auth & Onboarding

- `/login` — email + password login
- `/register` — self-service registration form
- `/claim-account` — legacy member account claiming
- `/forgot-password` — password reset

### Module 2 — Member Dashboard

- `/dashboard` — role-aware home: pending status notice, dues summary, upcoming events
- `/profile` — view own profile
- `/profile/edit` — edit own details, re-upload photo

### Module 3 — Dues & Payments

- `/dues` — member's own payment history
- `/dues/pay` — initiate online payment
- `/admin/dues` — exco: full payment overview with filters
- `/admin/dues/record` — exco: manual payment recording

### Module 4 — Member Management (Exco+)

- `/admin/members` — searchable, filterable member directory
- `/admin/members/[id]` — member detail with action buttons (approve, upgrade, suspend)
- `/admin/members/add` — onsite registration
- `/admin/members/migrate` — legacy migration tool

### Module 5 — Events

- `/events` — all published events
- `/events/[id]` — event detail
- `/admin/events` — exco event management
- `/admin/events/create` — create event

### Module 6 — Announcements

- `/announcements` — member-facing announcements
- `/admin/announcements/create` — exco compose + publish

### Module 7 — Super Admin

- `/admin/settings` — system configuration
- Exco account management within `/admin/members` (role upgrade to exco)
- Audit log viewer

---

## 12. API ROUTES STRUCTURE

```typescript
// src/app/api/auth/callback/route.ts
// Handles Supabase OAuth/magic link callbacks
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
```

```typescript
// src/app/api/payment/webhook/route.ts
// Receives payment gateway callbacks
import { adminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature =
    request.headers.get("monnify-signature") ||
    request.headers.get("opay-signature");

  // 1. Verify signature
  const expectedSig = crypto
    .createHmac("sha512", process.env.PAYMENT_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  if (signature !== expectedSig) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body);
  const reference = payload.paymentReference || payload.reference;

  // 2. Update payment record
  const status = payload.paymentStatus === "PAID" ? "confirmed" : "failed";

  await adminClient
    .from("payments")
    .update({ status, gateway_response: payload })
    .eq("payment_reference", reference);

  // 3. Log and notify — add audit_log entry + trigger email via Resend

  return NextResponse.json({ received: true });
}
```

---

## 13. MIDDLEWARE & ROUTE PROTECTION

```typescript
// middleware.ts (root level)
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password"];
const CLAIM_ROUTE = "/claim-account";
const EXCO_ROUTES = ["/admin"];
const SUPER_ADMIN_ROUTES = ["/admin/settings"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((r) => pathname === r)) {
    return NextResponse.next();
  }

  // Allow claim route (validated by token, not session)
  if (pathname.startsWith(CLAIM_ROUTE)) {
    return NextResponse.next();
  }

  // Create Supabase middleware client
  let response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /* cookie handlers */
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in → redirect to login
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check role for protected routes
  if (pathname.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["exco", "super_admin"].includes(profile.role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Super admin only routes
    if (
      pathname.startsWith("/admin/settings") &&
      profile.role !== "super_admin"
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
```

---

## 14. ENVIRONMENT VARIABLES

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server only — never expose

# Monnify
MONNIFY_API_KEY=your-monnify-api-key
MONNIFY_SECRET_KEY=your-monnify-secret-key
MONNIFY_CONTRACT_CODE=your-contract-code
MONNIFY_BASE_URL=https://api.monnify.com  # or sandbox URL

# OPay
OPAY_MERCHANT_ID=your-opay-merchant-id
OPAY_PUBLIC_KEY=your-opay-public-key
OPAY_PRIVATE_KEY=your-opay-private-key

# Payment Webhook
PAYMENT_WEBHOOK_SECRET=your-webhook-signing-secret

# Resend (Email)
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=noreply@nfcs-unn.org

# App
NEXT_PUBLIC_APP_URL=https://nfcs-unn.vercel.app

# Vercel (auto-populated, no need to set manually)
# VERCEL_URL
```

---

## 15. SUPABASE STORAGE

```sql
-- Migration 003: Storage Buckets
-- Run in Supabase SQL Editor

-- Passport photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'passport-photos',
  'passport-photos',
  FALSE,                          -- Private: requires signed URL
  2097152,                        -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Documents bucket (for CSV imports, receipts, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'documents',
  'documents',
  FALSE,
  10485760                        -- 10MB
);

-- Storage RLS
CREATE POLICY "users_upload_own_photo"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'passport-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "users_read_own_photo"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'passport-photos'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR is_exco_or_above()
    )
  );

CREATE POLICY "exco_manage_documents"
  ON storage.objects FOR ALL
  USING (bucket_id = 'documents' AND is_exco_or_above());
```

### Photo Upload Helper

```typescript
// In your Server Action
async function uploadPassportPhoto(
  file: File,
  userId: string,
): Promise<string> {
  const supabase = await createClient();
  const ext = file.name.split(".").pop();
  const path = `${userId}/passport.${ext}`;

  const { error } = await supabase.storage
    .from("passport-photos")
    .upload(path, file, { upsert: true });

  if (error) throw new Error("Photo upload failed");

  // Return signed URL (valid 1 year, refresh as needed)
  const { data } = await supabase.storage
    .from("passport-photos")
    .createSignedUrl(path, 365 * 24 * 60 * 60);

  return data?.signedUrl ?? "";
}
```

---

## 16. EMAIL NOTIFICATION SYSTEM

Using **Resend** + **React Email**:

| Trigger                     | Template                                      | Recipient          |
| --------------------------- | --------------------------------------------- | ------------------ |
| Self-registration submitted | `RegistrationConfirmation.tsx`                | New member         |
| Registration approved       | `ApprovalNotification.tsx`                    | Member             |
| Registration rejected       | `ApprovalNotification.tsx` (rejected variant) | Member             |
| Dues payment confirmed      | `DuesReceipt.tsx`                             | Member             |
| Manual payment recorded     | `DuesReceipt.tsx`                             | Member             |
| Event published             | `EventInvitation.tsx`                         | All active members |
| Legacy claim invite         | `ClaimAccountInvite.tsx`                      | Legacy member      |
| Onsite registration         | Welcome email                                 | New member         |

```typescript
// src/lib/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  return resend.emails.send({
    from: `NFCS UNN <${process.env.RESEND_FROM_EMAIL}>`,
    to,
    subject,
    react,
  });
}
```

---

## 17. BOOTSTRAP BUILD ORDER

Build in this exact sequence. Each phase produces working, testable functionality before moving to the next.

### Phase 0 — Project Setup (Day 1)

- [ ] `npx create-next-app` with flags above
- [ ] Install all dependencies
- [ ] Set up Supabase project, copy keys to `.env.local`
- [ ] Apply Migration 001 (schema) → Migration 002 (RLS) → Migration 003 (storage)
- [ ] Run `seed.sql` to create super-admin account
- [ ] Set up Vercel project, connect GitHub repo, add env vars
- [ ] Apply your `design.json` → generate Tailwind config + base UI components
- [ ] Verify Supabase Auth + Vercel deployment work end-to-end

### Phase 1 — Auth System (Days 2–3)

- [ ] `/login` page + LoginForm
- [ ] `/forgot-password` page
- [ ] `middleware.ts` route protection
- [ ] `useUser` hook (reads profile + role)
- [ ] Portal layout with role-aware sidebar
- [ ] Dashboard stub pages per role

### Phase 2 — Registration Flow (Days 4–6)

- [ ] `/register` — RegistrationForm with all fields + photo upload
- [ ] Server Action: `registerMember()`
- [ ] Photo upload to Supabase Storage
- [ ] Pending state UI (member sees "awaiting approval")
- [ ] `/admin/members` — list of pending registrations
- [ ] Approve/Reject functionality + email notifications
- [ ] `/admin/members/add` — OnsiteRegistrationForm

### Phase 3 — Member Profile & Directory (Days 7–8)

- [ ] `/profile` — view own profile with passport photo
- [ ] `/profile/edit` — edit form (fields member can change)
- [ ] `/admin/members` — full searchable directory with filters
- [ ] `/admin/members/[id]` — member detail + admin actions
- [ ] Student → Alumnus upgrade modal

### Phase 4 — Legacy Migration System (Days 9–11)

- [ ] Migration 004 (legacy tables SQL)
- [ ] CSV template download
- [ ] `/admin/members/migrate` — CSV uploader + manual entry
- [ ] MigrationPreview component with validation warnings
- [ ] `bulkMigrateLegacyMembers()` Server Action
- [ ] Historical dues import
- [ ] `/claim-account` page with token validation
- [ ] `sendClaimInvite()` + `claimLegacyAccount()` Server Actions
- [ ] Admin-created account flow

### Phase 5 — Payments (Days 12–14)

- [ ] Manual payment recording (`/admin/dues/record`)
- [ ] Dues history view for members (`/dues`)
- [ ] Monnify integration (initiate + webhook)
- [ ] OPay integration (initiate + webhook)
- [ ] `/api/payment/webhook` route with signature verification
- [ ] DuesReceipt email
- [ ] Payment status badges + history tables

### Phase 6 — Events & Announcements (Days 15–17)

- [ ] Events CRUD (Exco) + public listing (members)
- [ ] Announcements CRUD (Exco) + public listing
- [ ] Email blast for new event/announcement

### Phase 7 — Super Admin & Polish (Days 18–20)

- [ ] Audit log viewer
- [ ] Account suspension
- [ ] Exco account management
- [ ] `/admin/settings`
- [ ] Dashboard stats/metrics (total members, dues collected, pending approvals)
- [ ] Mobile responsiveness pass
- [ ] End-to-end testing of all flows

---

## 18. CURSOR/ANTIGRAVITY AI PROMPTING RULES

Use these as system-level rules or paste at the top of any AI prompt in your IDE:

```
You are building the NFCS UNN Portal — a Next.js 14 App Router application.

STACK RULES:
- Use Next.js App Router with Server Components and Server Actions
- All DB access via @supabase/ssr — never import supabase client in client components directly; use the hook
- Forms use React Hook Form + Zod; always validate on both client and server
- All UI uses Tailwind CSS; class merging via cn() utility (clsx + tailwind-merge)
- Design tokens come from design.json — never hardcode colors or spacing

ARCHITECTURE RULES:
- Server Actions live in /src/lib/actions/*.actions.ts
- Zod schemas live in /src/lib/validations/*.schema.ts
- Types come from /src/types/*.types.ts
- Use the adminClient (service role) ONLY in API routes and Server Actions — never in client components
- All sensitive operations write to the audit_log table

ROLES:
- student | alumnus | exco | super_admin
- Check role via get_user_role() DB function or useUser() hook
- Middleware enforces route-level access; RLS enforces data-level access

ORGANS (use exact enum values):
- gospel_band | evangelical_committee | federation_theater | social_communications_commission | discipline_committee

PAYMENTS:
- Two channels: online (Monnify/OPay) and manual (Exco-recorded)
- Payment status updates ONLY via webhook or exco action — never client-side
- All payments link to profile_id OR legacy_member_id

LEGACY MIGRATION:
- Legacy members live in legacy_members table (not profiles)
- They claim accounts via /claim-account?token= or admin-created credentials
- On claim: transfer all legacy payments to new profile_id

NEVER:
- Expose SUPABASE_SERVICE_ROLE_KEY to the browser
- Bypass RLS by using adminClient in client components
- Update payment status from client-side code
- Hardcode organ or role values — always import from constants
```

---

## APPENDIX — SEED SQL

```sql
-- supabase/seed.sql
-- Run AFTER schema migrations

-- Insert initial super admin
-- First create via Supabase Auth dashboard, get the UUID, then:

UPDATE profiles
SET
  full_name = 'NFCS Super Admin',
  role = 'super_admin',
  status = 'active'
WHERE email = 'admin@nfcs-unn.org';

-- Verify roles enum values are correct
SELECT unnest(enum_range(NULL::user_role));
SELECT unnest(enum_range(NULL::organ_type));
```

---

_Document version: 1.0 | NFCS UNN Portal | Built for Antigravity IDE_
_Stack: Next.js 14 + Supabase + Vercel | Last updated: June 2026_
