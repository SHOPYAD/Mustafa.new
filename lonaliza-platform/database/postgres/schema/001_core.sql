-- Core tables mirrored from PocketBase collections (incremental rollout).
-- Run after setting DATABASE_URL. IDs stay TEXT compatible with PocketBase record ids.

CREATE TABLE IF NOT EXISTS platform_db_meta (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  email TEXT,
  phone TEXT,
  name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hotel_bookings (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  hotel_id TEXT NOT NULL,
  hotel_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'TRY',
  check_in DATE,
  check_out DATE,
  customer_name TEXT,
  customer_email TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enquiry_bookings (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hotel_bookings_updated ON hotel_bookings (updated DESC);
CREATE INDEX IF NOT EXISTS idx_enquiry_bookings_updated ON enquiry_bookings (updated DESC);
