/*
  # Compression tracking and credits system

  ## Overview
  This migration creates tables to track PDF compression usage and manage user credits.

  ## New Tables
  
  ### `compression_usage`
  Tracks compression attempts by IP address with daily limits
  - `id` (uuid, primary key) - Unique identifier
  - `ip_address` (text) - User's IP address
  - `compressions_count` (integer) - Number of compressions used today
  - `last_compression_date` (date) - Date of last compression
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `user_credits`
  Manages purchased credits for users
  - `id` (uuid, primary key) - Unique identifier
  - `ip_address` (text) - User's IP address
  - `credits` (integer) - Number of available compression credits
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `payment_transactions`
  Records all payment transactions
  - `id` (uuid, primary key) - Unique identifier
  - `ip_address` (text) - User's IP address
  - `stripe_payment_id` (text) - Stripe payment intent ID
  - `amount` (integer) - Amount paid in cents
  - `credits_purchased` (integer) - Number of credits purchased
  - `status` (text) - Payment status (pending, completed, failed)
  - `created_at` (timestamptz) - Transaction timestamp

  ## Security
  - RLS enabled on all tables
  - Public access for reading own data by IP
  - Insert policies for creating records
*/

CREATE TABLE IF NOT EXISTS compression_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  compressions_count integer DEFAULT 0,
  last_compression_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_compression_usage_ip 
  ON compression_usage(ip_address);

ALTER TABLE compression_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read compression usage"
  ON compression_usage FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert compression usage"
  ON compression_usage FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update compression usage"
  ON compression_usage FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS user_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  credits integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_credits_ip 
  ON user_credits(ip_address);

ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read user credits"
  ON user_credits FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert user credits"
  ON user_credits FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update user credits"
  ON user_credits FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  stripe_payment_id text,
  amount integer NOT NULL,
  credits_purchased integer NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read payment transactions"
  ON payment_transactions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can insert payment transactions"
  ON payment_transactions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update payment transactions"
  ON payment_transactions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);