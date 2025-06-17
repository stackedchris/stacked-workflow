import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = 'https://idmgjyhbpizcuptrmrky.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkbWdqeWhicGl6Y3VwdHJta3kiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc1MDE4NjI4NiwiZXhwIjoyMDY1NzYyMjg2fQ.5ryQP5WVc4PhUoqXTn0c5CrwBwGjeT7w1NP_OqjRirk'

    console.log('🔄 Attempting fresh database setup...')

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test basic connection first
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.error('❌ Auth connection failed:', authError)
      return NextResponse.json({
        success: false,
        error: `Connection failed: ${authError.message}`,
        solution: 'Check your Supabase URL and API key'
      })
    }

    console.log('✅ Basic connection successful')

    // Try to query creators table to see current state
    console.log('🔍 Checking current database state...')
    const { data: existingCreators, error: queryError } = await supabase
      .from('creators')
      .select('id, name')
      .limit(5)

    if (queryError) {
      console.log('⚠️ Database needs setup:', queryError.message)
      
      return NextResponse.json({
        success: false,
        step: 'database_setup_needed',
        error: 'Database tables need to be set up',
        solution: 'Please run the fresh setup SQL in your Supabase dashboard',
        sqlToRun: `-- FRESH DATABASE SETUP FOR STACKED WORKFLOW PLATFORM
-- Run this entire script in your Supabase SQL Editor

-- Step 1: Clean slate - Drop everything and start fresh
DROP TABLE IF EXISTS content CASCADE;
DROP TABLE IF EXISTS creators CASCADE;

-- Step 2: Create creators table with all required fields
CREATE TABLE creators (
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

-- Step 3: Create content table
CREATE TABLE content (
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

-- Step 4: Enable Row Level Security
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Step 5: Create simple, clean policies
CREATE POLICY "creators_all_access" ON creators USING (true) WITH CHECK (true);
CREATE POLICY "content_all_access" ON content USING (true) WITH CHECK (true);

-- Step 6: Create performance indexes
CREATE INDEX idx_creators_category ON creators(category);
CREATE INDEX idx_creators_phase_number ON creators(phase_number);
CREATE INDEX idx_content_creator_id ON content(creator_id);
CREATE INDEX idx_content_status ON content(status);

-- Step 7: Insert sample data
INSERT INTO creators (name, email, phone, category, region, phase, phase_number, cards_sold, total_cards, card_price, days_in_phase, next_task, sales_velocity, avatar, bio, social_media, strategy) VALUES
('Kurama', 'kurama@example.com', '+1 (555) 123-4567', 'Gaming', 'US', 'Phase 2: Launch Week', 2, 67, 100, 100.00, 2, 'Post group chat screenshot', 'High', '🎮', 'Top Smash Bros player with 500K+ following', '{"instagram": "@kurama_smash", "twitter": "@KuramaPlays", "youtube": "@KuramaGaming", "tiktok": "@kurama.gaming"}', '{"launchDate": "2025-06-20", "targetAudience": "Competitive gaming fans", "contentPlan": "Daily gameplay tips"}'),
('Nina Lin', 'nina@example.com', '+1 (555) 234-5678', 'Streaming', 'US', 'Phase 1: Drop Prep', 1, 0, 100, 75.00, 5, 'Record teaser video', 'Pending', '📺', 'Popular streamer and co-founder', '{"instagram": "@ninalin", "twitter": "@NinaStreams", "tiktok": "@nina.streams"}', '{"launchDate": "2025-06-25", "targetAudience": "Streaming community", "contentPlan": "Stream highlights"}'),
('Edward So', 'edward@example.com', '+1 (555) 345-6789', 'Music', 'Brazil', 'Phase 3: Sell-Out Push', 3, 85, 100, 90.00, 1, 'Post only 15 left story', 'Medium', '🎵', 'DJ and creative entrepreneur', '{"instagram": "@edwardso", "twitter": "@EdwardSoMusic", "tiktok": "@edward.djmusic"}', '{"launchDate": "2025-06-18", "targetAudience": "Music fans", "contentPlan": "Live sets and remixes"}');

-- Step 8: Verify setup
SELECT 'Setup complete! Total creators: ' || COUNT(*) as result FROM creators;`
      })
    }

    console.log('✅ Database is accessible, found creators:', existingCreators?.length || 0)

    // If we can query successfully, the database is working
    return NextResponse.json({
      success: true,
      message: 'Database is working correctly!',
      data: {
        creatorsCount: existingCreators?.length || 0,
        sampleCreators: existingCreators || [],
        connectionTime: new Date().toISOString(),
        status: 'ready'
      }
    })

  } catch (error) {
    console.error('❌ Database check failed:', error)
    return NextResponse.json({
      success: false,
      error: `Database check failed: ${(error as Error).message}`,
      solution: 'Please run the fresh setup SQL to initialize the database'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ready',
    message: 'Database reset endpoint is available',
    timestamp: new Date().toISOString()
  })
}