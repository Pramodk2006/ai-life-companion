-- Copy and paste this entire SQL script into your Supabase SQL Editor
-- Go to: https://vzygruxknflemhzuebgd.supabase.co/project/vzygruxknflemhzuebgd/sql

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'ai', 'scraper')),
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    message_type TEXT DEFAULT 'text',
    platform TEXT DEFAULT 'console',
    scraped_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goal progress table  
CREATE TABLE IF NOT EXISTS goal_progress (
    id SERIAL PRIMARY KEY,
    goal_id INTEGER REFERENCES goals(id) ON DELETE CASCADE,
    progress_note TEXT,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
    energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profile table
CREATE TABLE IF NOT EXISTS user_profile (
    user_id INTEGER PRIMARY KEY DEFAULT 1,
    name TEXT,
    phone TEXT,
    preferences JSONB DEFAULT '{}',
    social_profiles JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_timestamp ON conversations(timestamp);
CREATE INDEX IF NOT EXISTS idx_conversations_sender ON conversations(sender);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goal_progress_goal_id ON goal_progress(goal_id);

-- Insert your user profile
INSERT INTO user_profile (user_id, name, phone, preferences, social_profiles) 
VALUES (
    1, 
    'pramod', 
    '+919080459028', 
    '{"proactive_messaging": true, "morning_checkin": true, "evening_reflection": true, "hourly_checkins": false, "goal_reminders": true}',
    '{"github": "pramodk2006", "leetcode": "pramod_k31"}'
) ON CONFLICT (user_id) DO UPDATE SET 
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    preferences = EXCLUDED.preferences,
    social_profiles = EXCLUDED.social_profiles,
    updated_at = NOW();