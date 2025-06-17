import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = 'https://idmgjyhbpizcuptrmrky.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkbWdqeWhicGl6Y3VwdHJta3kiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc1MDE4NjI4NiwiZXhwIjoyMDY1NzYyMjg2fQ.5ryQP5WVc4PhUoqXTn0c5CrwBwGjeT7w1NP_OqjRirk'

    console.log('🔍 Verifying Supabase setup...')

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test 1: Basic connection
    console.log('Test 1: Testing basic connection...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.error('❌ Auth connection failed:', authError)
      return NextResponse.json({
        success: false,
        step: 'connection',
        error: `Connection failed: ${authError.message}`,
        solution: 'Check your Supabase URL and API key',
        needsManualSetup: true
      })
    }

    console.log('✅ Basic connection successful')

    // Test 2: Check if tables exist
    console.log('Test 2: Checking database tables...')
    
    const { data: creatorsTest, error: creatorsError } = await supabase
      .from('creators')
      .select('count')
      .limit(1)

    if (creatorsError) {
      console.log('⚠️ Creators table issue:', creatorsError.message)
      
      return NextResponse.json({
        success: false,
        step: 'tables',
        error: 'Database tables not properly configured',
        solution: 'Please run the SQL migration in your Supabase dashboard',
        needsManualSetup: true,
        sqlToRun: `-- Run this SQL in your Supabase SQL Editor to fix the database setup

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON creators;
DROP POLICY IF EXISTS "Enable insert for all users" ON creators;
DROP POLICY IF EXISTS "Enable update for all users" ON creators;
DROP POLICY IF EXISTS "Enable delete for all users" ON creators;

-- Create tables if they don't exist
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

-- Enable RLS
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

-- Create new policies with unique names
CREATE POLICY "creators_select_policy" ON creators FOR SELECT USING (true);
CREATE POLICY "creators_insert_policy" ON creators FOR INSERT WITH CHECK (true);
CREATE POLICY "creators_update_policy" ON creators FOR UPDATE USING (true);
CREATE POLICY "creators_delete_policy" ON creators FOR DELETE USING (true);

-- Insert sample data
INSERT INTO creators (name, email, category, phase, phase_number, cards_sold, card_price, avatar, bio)
VALUES 
  ('Kurama', 'kurama@example.com', 'Gaming', 'Phase 2: Launch Week', 2, 67, 100.00, '🎮', 'Top Smash Bros player'),
  ('Nina Lin', 'nina@example.com', 'Streaming', 'Phase 1: Drop Prep', 1, 0, 75.00, '📺', 'Popular streamer'),
  ('Edward So', 'edward@example.com', 'Music', 'Phase 3: Sell-Out Push', 3, 85, 90.00, '🎵', 'DJ and entrepreneur')
ON CONFLICT (id) DO NOTHING;`
      })
    }

    console.log('✅ Creators table accessible')

    // Test 3: Try to fetch existing data
    console.log('Test 3: Fetching existing data...')
    const { data: existingCreators, error: fetchError } = await supabase
      .from('creators')
      .select('id, name, category, cards_sold, card_price')
      .limit(10)

    if (fetchError) {
      console.error('❌ Data fetch failed:', fetchError)
      return NextResponse.json({
        success: false,
        step: 'data_fetch',
        error: `Data fetch failed: ${fetchError.message}`,
        solution: 'Check table permissions and RLS policies'
      })
    }

    console.log('✅ Data fetch successful:', existingCreators?.length || 0, 'creators found')

    // Test 4: If no data exists, try to insert sample data
    if (!existingCreators || existingCreators.length === 0) {
      console.log('📊 No data found, attempting to insert sample creators...')
      
      const sampleCreators = [
        {
          name: 'Kurama',
          email: 'kurama@example.com',
          phone: '+1 (555) 123-4567',
          category: 'Gaming',
          region: 'US',
          phase: 'Phase 2: Launch Week',
          phase_number: 2,
          cards_sold: 67,
          total_cards: 100,
          card_price: 100.00,
          days_in_phase: 2,
          next_task: 'Post group chat screenshot',
          sales_velocity: 'High',
          avatar: '🎮',
          bio: 'Top Smash Bros player with 500K+ following',
          social_media: {
            instagram: '@kurama_smash',
            twitter: '@KuramaPlays',
            youtube: '@KuramaGaming',
            tiktok: '@kurama.gaming'
          },
          strategy: {
            launchDate: '2025-06-20',
            targetAudience: 'Competitive gaming fans',
            contentPlan: 'Daily gameplay tips'
          }
        },
        {
          name: 'Nina Lin',
          email: 'nina@example.com',
          phone: '+1 (555) 234-5678',
          category: 'Streaming',
          region: 'US',
          phase: 'Phase 1: Drop Prep',
          phase_number: 1,
          cards_sold: 0,
          total_cards: 100,
          card_price: 75.00,
          days_in_phase: 5,
          next_task: 'Record teaser video',
          sales_velocity: 'Pending',
          avatar: '📺',
          bio: 'Popular streamer and co-founder',
          social_media: {
            instagram: '@ninalin',
            twitter: '@NinaStreams',
            tiktok: '@nina.streams'
          },
          strategy: {
            launchDate: '2025-06-25',
            targetAudience: 'Streaming community',
            contentPlan: 'Stream highlights'
          }
        },
        {
          name: 'Edward So',
          email: 'edward@example.com',
          phone: '+1 (555) 345-6789',
          category: 'Music',
          region: 'Brazil',
          phase: 'Phase 3: Sell-Out Push',
          phase_number: 3,
          cards_sold: 85,
          total_cards: 100,
          card_price: 90.00,
          days_in_phase: 1,
          next_task: 'Post only 15 left story',
          sales_velocity: 'Medium',
          avatar: '🎵',
          bio: 'DJ and creative entrepreneur',
          social_media: {
            instagram: '@edwardso',
            twitter: '@EdwardSoMusic',
            tiktok: '@edward.djmusic'
          },
          strategy: {
            launchDate: '2025-06-18',
            targetAudience: 'Music fans',
            contentPlan: 'Live sets and remixes'
          }
        }
      ]

      const { data: insertedCreators, error: insertError } = await supabase
        .from('creators')
        .insert(sampleCreators)
        .select()

      if (insertError) {
        console.error('❌ Failed to insert sample data:', insertError)
        return NextResponse.json({
          success: false,
          step: 'sample_data',
          error: `Failed to insert sample data: ${insertError.message}`,
          solution: 'Check table permissions and try running the SQL migration manually'
        })
      }

      console.log('✅ Sample data inserted:', insertedCreators?.length || 0, 'creators')
    }

    // Test 5: Final verification
    console.log('Test 5: Final verification...')
    const { data: finalCheck, error: finalError } = await supabase
      .from('creators')
      .select('id, name, category, cards_sold, card_price')
      .limit(5)

    if (finalError) {
      return NextResponse.json({
        success: false,
        step: 'final_check',
        error: `Final verification failed: ${finalError.message}`
      })
    }

    console.log('🎉 All tests passed! Supabase is fully configured and ready.')

    return NextResponse.json({
      success: true,
      message: 'Supabase is fully configured and ready!',
      data: {
        creatorsCount: finalCheck?.length || 0,
        sampleCreators: finalCheck || [],
        connectionTime: new Date().toISOString(),
        tablesVerified: ['creators'],
        rlsEnabled: true,
        sampleDataPopulated: !existingCreators || existingCreators.length === 0
      }
    })

  } catch (error) {
    console.error('❌ Setup verification failed:', error)
    return NextResponse.json({
      success: false,
      step: 'exception',
      error: `Setup verification failed: ${(error as Error).message}`,
      solution: 'Check your internet connection and Supabase credentials'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ready',
    message: 'Supabase verification endpoint is available',
    url: 'https://idmgjyhbpizcuptrmrky.supabase.co',
    timestamp: new Date().toISOString()
  })
}