-- Lead Collector Database Schema

-- 1. COMPANIES
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'Ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. PROFILES (Sellers/Admins)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  auth_user_id UUID UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  username TEXT UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'vendor',
  company_id TEXT REFERENCES companies(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Ativo',
  is_protected BOOLEAN NOT NULL DEFAULT false,
  avatar TEXT,
  password TEXT, -- Plain text password for on-demand auth sync
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT NOT NULL DEFAULT 'Outros',
  line TEXT,
  company_id TEXT REFERENCES companies(id) ON DELETE SET NULL,
  company_name TEXT,
  description TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'Ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. EVENTS
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  state TEXT NOT NULL,
  state_uf TEXT,
  city TEXT NOT NULL,
  city_id INTEGER,
  location TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  company_id TEXT REFERENCES companies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. EVENT PRODUCTS (n:n)
CREATE TABLE IF NOT EXISTS event_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, product_id)
);

-- 6. EVENT SELLERS (n:n)
CREATE TABLE IF NOT EXISTS event_sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  seller_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, seller_id)
);

-- 7. LEADS
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES events(id) ON DELETE SET NULL,
  event_name TEXT,
  seller_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  seller_name TEXT,
  company_id TEXT REFERENCES companies(id) ON DELETE SET NULL,
  company_name TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  state TEXT NOT NULL,
  state_uf TEXT,
  city TEXT NOT NULL,
  city_id INTEGER,
  products_of_interest JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'Novo',
  origin TEXT NOT NULL DEFAULT 'evento/app',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
