-- Final database fix for Stacked Workflow Platform
-- This migration handles all existing conflicts and ensures clean setup

-- First, let's check what exists and clean it up properly
DO $$
BEGIN
    -- Drop all existing policies for creators table
    DROP POLICY IF EXISTS "Enable read access for all users" ON creators;
    DROP POLICY IF EXISTS "Enable insert for all users" ON creators;
    DROP POLICY IF EXISTS "Enable update for all users" ON creators;
    DROP POLICY IF EXISTS "Enable delete for all users" ON creators;
    DROP POLICY IF EXISTS "creators_select_policy" ON creators;
    DROP POLICY IF EXISTS "creators_insert_policy" ON creators;
    DROP POLICY IF EXISTS "creators_update_policy" ON creators;
    DROP POLICY IF EXISTS "creators_delete_policy" ON creators;
    
    -- Drop all existing policies for content table
    DROP POLICY IF EXISTS "Enable read access for all users" ON content;
    DROP POLICY IF EXISTS "Enable insert for all users" ON content;
    DROP POLICY IF EXISTS "Enable update for all users" ON content;
    DROP POLICY IF EXISTS "Enable delete for all users" ON content;
    DROP POLICY IF EXISTS "content_select_policy" ON content;
    DROP POLICY IF EXISTS "content_insert_policy" ON content;
    DROP POLICY IF EXISTS "content_update_policy" ON content;
    DROP POLICY IF EXISTS "content_delete_policy" ON content;
    
    RAISE NOTICE 'Cleaned up existing policies';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Some policies may not have existed: %', SQLERRM;
END $$;

-- Ensure tables exist with correct structure
CREATE TABLE IF NOT EXISTS creators (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  category TEXT NOT NULL,
  region TEXT DEFAULT 'US',
  phase TEXT NOT NULL DEFAULT 'Phase 0: Strategy Call',
  phase_number INTEGER DEFAULT 0,
  cards_sold INTEGER DEFAULT 0,
  total_cards INTEGER DEFAULT 100,
  card_price DECIMAL(10,2) DEFAULT 100.00,
  days_in_phase INTEGER DEFAULT 0,
  next_task TEXT DEFAULT 'Schedule strategy call',
  sales_velocity TEXT DEFAULT 'Pending',
  avatar TEXT DEFAULT '👤',
  bio TEXT,
  social_media JSONB DEFAULT '{}',
  assets JSONB DEFAULT '{"profileImages": [], "videos": [], "pressKit": []}',
  strategy JSONB DEFAULT '{}',
  stacked_profile_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  creator_id BIGINT REFERENCES creators(id) ON DELETE SET NULL,
  scheduled_date TIMESTAMPTZ,
  posted_date TIMESTAMPTZ,
  priority TEXT DEFAULT 'medium',
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  upload_date DATE DEFAULT CURRENT_DATE,
  size BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Create fresh policies with timestamp-based unique names to avoid any conflicts
DO $$
DECLARE
    policy_suffix TEXT := extract(epoch from now())::text;
BEGIN
    -- Create unique policies for creators
    EXECUTE format('CREATE POLICY "creators_select_%s" ON creators FOR SELECT USING (true)', policy_suffix);
    EXECUTE format('CREATE POLICY "creators_insert_%s" ON creators FOR INSERT WITH CHECK (true)', policy_suffix);
    EXECUTE format('CREATE POLICY "creators_update_%s" ON creators FOR UPDATE USING (true)', policy_suffix);
    EXECUTE format('CREATE POLICY "creators_delete_%s" ON creators FOR DELETE USING (true)', policy_suffix);
    
    -- Create unique policies for content
    EXECUTE format('CREATE POLICY "content_select_%s" ON content FOR SELECT USING (true)', policy_suffix);
    EXECUTE format('CREATE POLICY "content_insert_%s" ON content FOR INSERT WITH CHECK (true)', policy_suffix);
    EXECUTE format('CREATE POLICY "content_update_%s" ON content FOR UPDATE USING (true)', policy_suffix);
    EXECUTE format('CREATE POLICY "content_delete_%s" ON content FOR DELETE USING (true)', policy_suffix);
    
    RAISE NOTICE 'Created policies with suffix: %', policy_suffix;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_creators_category ON creators(category);
CREATE INDEX IF NOT EXISTS idx_creators_phase_number ON creators(phase_number);
CREATE INDEX IF NOT EXISTS idx_creators_sales_velocity ON creators(sales_velocity);
CREATE INDEX IF NOT EXISTS idx_content_creator_id ON content(creator_id);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_content_scheduled_date ON content(scheduled_date);

-- Insert sample data only if no creators exist
INSERT INTO creators (name, email, phone, category, region, phase, phase_number, cards_sold, total_cards, card_price, days_in_phase, next_task, sales_velocity, avatar, bio, social_media, strategy)
SELECT 
  'Kurama',
  'kurama@example.com',
  '+1 (555) 123-4567',
  'Gaming',
  'US',
  'Phase 2: Launch Week',
  2,
  67,
  100,
  100.00,
  2,
  'Post group chat screenshot',
  'High',
  '🎮',
  'Top Smash Bros player with 500K+ following',
  '{"instagram": "@kurama_smash", "twitter": "@KuramaPlays", "youtube": "@KuramaGaming", "tiktok": "@kurama.gaming"}',
  '{"launchDate": "2025-06-20", "targetAudience": "Competitive gaming fans", "contentPlan": "Daily gameplay tips"}'
WHERE NOT EXISTS (SELECT 1 FROM creators LIMIT 1);

INSERT INTO creators (name, email, phone, category, region, phase, phase_number, cards_sold, total_cards, card_price, days_in_phase, next_task, sales_velocity, avatar, bio, social_media, strategy)
SELECT 
  'Nina Lin',
  'nina@example.com',
  '+1 (555) 234-5678',
  'Streaming',
  'US',
  'Phase 1: Drop Prep',
  1,
  0,
  100,
  75.00,
  5,
  'Record teaser video',
  'Pending',
  '📺',
  'Popular streamer and co-founder',
  '{"instagram": "@ninalin", "twitter": "@NinaStreams", "tiktok": "@nina.streams"}',
  '{"launchDate": "2025-06-25", "targetAudience": "Streaming community", "contentPlan": "Stream highlights"}'
WHERE NOT EXISTS (SELECT 1 FROM creators WHERE name = 'Nina Lin');

INSERT INTO creators (name, email, phone, category, region, phase, phase_number, cards_sold, total_cards, card_price, days_in_phase, next_task, sales_velocity, avatar, bio, social_media, strategy)
SELECT 
  'Edward So',
  'edward@example.com',
  '+1 (555) 345-6789',
  'Music',
  'Brazil',
  'Phase 3: Sell-Out Push',
  3,
  85,
  100,
  90.00,
  1,
  'Post only 15 left story',
  'Medium',
  '🎵',
  'DJ and creative entrepreneur',
  '{"instagram": "@edwardso", "twitter": "@EdwardSoMusic", "tiktok": "@edward.djmusic"}',
  '{"launchDate": "2025-06-18", "targetAudience": "Music fans", "contentPlan": "Live sets and remixes"}'
WHERE NOT EXISTS (SELECT 1 FROM creators WHERE name = 'Edward So');

-- Final verification
DO $$
DECLARE
    creator_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO creator_count FROM creators;
    RAISE NOTICE 'Database setup complete. Total creators: %', creator_count;
END $$;