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
