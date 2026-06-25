-- RLS Policies for Lead Collector

-- Helper functions to get current user details from auth.uid()
CREATE OR REPLACE FUNCTION current_profile_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION current_profile_company_id()
RETURNS TEXT AS $$
  SELECT company_id FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 1. COMPANIES POLICIES
-- ==========================================
CREATE POLICY "Root admins have full access to companies" ON companies
  FOR ALL USING (current_profile_role() = 'root_admin');

CREATE POLICY "Company admins can view and update their own company" ON companies
  FOR ALL USING (
    current_profile_role() = 'company_admin' AND id = current_profile_company_id()
  );

CREATE POLICY "All authenticated users can view active companies" ON companies
  FOR SELECT USING (auth.uid() IS NOT NULL);


-- ==========================================
-- 2. PROFILES POLICIES
-- ==========================================
CREATE POLICY "Unauthenticated users can view profiles by email or username for login" ON profiles
  FOR SELECT USING (true); -- Required for on-the-fly login checks before auth session

CREATE POLICY "Root admins have full access to profiles" ON profiles
  FOR ALL USING (current_profile_role() = 'root_admin');

CREATE POLICY "Company admins can manage profiles in their own company" ON profiles
  FOR ALL USING (
    current_profile_role() = 'company_admin' 
    AND company_id = current_profile_company_id()
    AND role != 'root_admin'
  );

CREATE POLICY "Users can update their own profile details" ON profiles
  FOR UPDATE USING (
    auth_user_id = auth.uid()
  ) WITH CHECK (
    auth_user_id = auth.uid()
  );


-- ==========================================
-- 3. PRODUCTS POLICIES
-- ==========================================
CREATE POLICY "Root admins have full access to products" ON products
  FOR ALL USING (current_profile_role() = 'root_admin');

CREATE POLICY "Company admins can manage products for their own company" ON products
  FOR ALL USING (
    current_profile_role() = 'company_admin' 
    AND company_id = current_profile_company_id()
  );

CREATE POLICY "All authenticated users can view products" ON products
  FOR SELECT USING (auth.uid() IS NOT NULL);


-- ==========================================
-- 4. EVENTS POLICIES
-- ==========================================
CREATE POLICY "Root admins have full access to events" ON events
  FOR ALL USING (current_profile_role() = 'root_admin');

CREATE POLICY "Company admins can manage events for their own company" ON events
  FOR ALL USING (
    current_profile_role() = 'company_admin' 
    AND (company_id = current_profile_company_id() OR company_id IS NULL)
  );

CREATE POLICY "Vendors can view events they are assigned to" ON events
  FOR SELECT USING (
    current_profile_role() = 'vendor' AND
    id IN (SELECT event_id FROM event_sellers WHERE seller_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()))
  );


-- ==========================================
-- 5. EVENT_PRODUCTS POLICIES
-- ==========================================
CREATE POLICY "Root admins have full access to event_products" ON event_products
  FOR ALL USING (current_profile_role() = 'root_admin');

CREATE POLICY "Company admins can view and update event_products" ON event_products
  FOR ALL USING (
    current_profile_role() = 'company_admin'
  );

CREATE POLICY "All authenticated users can view event_products" ON event_products
  FOR SELECT USING (auth.uid() IS NOT NULL);


-- ==========================================
-- 6. EVENT_SELLERS POLICIES
-- ==========================================
CREATE POLICY "Root admins have full access to event_sellers" ON event_sellers
  FOR ALL USING (current_profile_role() = 'root_admin');

CREATE POLICY "Company admins can view and update event_sellers" ON event_sellers
  FOR ALL USING (
    current_profile_role() = 'company_admin'
  );

CREATE POLICY "All authenticated users can view event_sellers" ON event_sellers
  FOR SELECT USING (auth.uid() IS NOT NULL);


-- ==========================================
-- 7. LEADS POLICIES
-- ==========================================
CREATE POLICY "Root admins have full access to leads" ON leads
  FOR ALL USING (current_profile_role() = 'root_admin');

CREATE POLICY "Company admins can manage leads of their own company" ON leads
  FOR ALL USING (
    current_profile_role() = 'company_admin' 
    AND company_id = current_profile_company_id()
  );

CREATE POLICY "Vendors can insert and view their own leads" ON leads
  FOR ALL USING (
    seller_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
  );
