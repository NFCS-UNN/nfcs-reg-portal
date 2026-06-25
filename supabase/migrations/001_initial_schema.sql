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
  approved_by         UUID,                  -- Self-reference FK added below
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
  claimed_by_profile  UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Historical dues (from dues cards)
  dues_imported       BOOLEAN DEFAULT FALSE,

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Complete profiles table approved_by self-reference FK
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_approved_by FOREIGN KEY (approved_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- ─── PAYMENTS TABLE ────────────────────────────────────────

CREATE TABLE payments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Can belong to a profile OR a legacy member (not yet claimed)
  profile_id          UUID REFERENCES profiles(id) ON DELETE CASCADE,
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
  recorded_by         UUID REFERENCES profiles(id) ON DELETE SET NULL,
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
  created_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
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
  created_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─── AUDIT LOG ─────────────────────────────────────────────
-- Tracks all sensitive admin actions

CREATE TABLE audit_log (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id            UUID REFERENCES profiles(id) ON DELETE SET NULL,
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
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
    'student',
    'pending'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
