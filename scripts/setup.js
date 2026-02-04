const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function setupEnvironment() {
    console.log('🔧 Setting up environment configuration...\n');

    const userName = await question('Enter your name: ');
    const userPhone = await question('Enter your phone number (with country code, e.g., +1234567890): ') || '';
    const githubUsername = await question('Enter your GitHub username (optional): ') || '';
    const leetcodeUsername = await question('Enter your LeetCode username (optional): ') || '';
    const supabaseUrl = await question('Enter your Supabase URL: ');
    const supabaseKey = await question('Enter your Supabase anon key: ');
    const openaiKey = await question('Enter your OpenAI API key (optional, leave blank for fallback responses): ') || '';

    const envContent = `# Environment Configuration
SUPABASE_URL=${supabaseUrl}
SUPABASE_ANON_KEY=${supabaseKey}
OPENAI_API_KEY=${openaiKey}

# User Configuration
USER_PHONE=${userPhone}
USER_NAME=${userName}

# AI Configuration
AI_MODEL=gpt-3.5-turbo
MAX_MEMORY_TOKENS=4000

# Proactive Messaging
MORNING_CHECKIN_TIME=09:00
EVENING_CHECKIN_TIME=21:00
HOURLY_CHECKINS_ENABLED=false

# Scraping Configuration
GITHUB_USERNAME=${githubUsername}
LEETCODE_USERNAME=${leetcodeUsername}

# App Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=info`;

    const fs = require('fs');
    const path = require('path');
    
    const envPath = path.join(__dirname, '..', '.env');
    fs.writeFileSync(envPath, envContent);

    console.log('\\n✅ Environment file created at .env');
    return { userName, userPhone, githubUsername, leetcodeUsername, supabaseUrl, supabaseKey };
}

async function setupDatabase(supabaseUrl, supabaseKey) {
    console.log('\\n🗄️ Setting up database schema...');

    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log('\\n📝 Creating database tables...');

        // Test connection first
        const { data: testData, error: testError } = await supabase
            .from('conversations')
            .select('count', { count: 'exact', head: true });

        if (testError && testError.code === 'PGRST204') {
            console.log('\\n📋 Database tables need to be created in your Supabase dashboard.');
            console.log('\\nPlease run these SQL commands in your Supabase SQL editor:');
            console.log('\\n```sql');
            
            const createTablesSQL = `-- Conversations table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_timestamp ON conversations(timestamp);
CREATE INDEX IF NOT EXISTS idx_conversations_sender ON conversations(sender);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);`;
            
            console.log(createTablesSQL);
            console.log('```\\n');
            
            const createManually = await question('Have you created the tables in Supabase? (y/n): ');
            if (createManually.toLowerCase() !== 'y') {
                console.log('Please create the tables and run this setup again.');
                return false;
            }
        }

        console.log('✅ Database connection successful!');
        return true;

    } catch (error) {
        console.error('❌ Setup error:', error);
        return false;
    }
}

async function setupUserProfile(supabaseUrl, supabaseKey, userData) {
    console.log('\\n👤 Setting up your user profile...');

    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        const profileData = {
            user_id: 1,
            name: userData.userName,
            phone: userData.userPhone,
            preferences: {
                proactive_messaging: true,
                morning_checkin: true,
                evening_reflection: true,
                hourly_checkins: false,
                goal_reminders: true
            },
            social_profiles: {
                github: userData.githubUsername,
                leetcode: userData.leetcodeUsername
            }
        };

        const { data, error } = await supabase
            .from('user_profile')
            .upsert([profileData]);

        if (error) {
            console.error('❌ Error creating user profile:', error);
            return false;
        } else {
            console.log('✅ User profile created successfully!');
            return true;
        }

    } catch (error) {
        console.error('❌ Profile setup error:', error);
        return false;
    }
}

async function main() {
    console.log('🚀 AI Companion Setup\\n');
    console.log('This will help you configure your personal AI companion system.\\n');

    try {
        // Step 1: Environment setup
        const userData = await setupEnvironment();

        // Step 2: Database setup
        const dbSuccess = await setupDatabase(userData.supabaseUrl, userData.supabaseKey);
        
        if (!dbSuccess) {
            console.log('❌ Database setup failed. Please fix issues and try again.');
            return;
        }

        // Step 3: User profile
        const profileSuccess = await setupUserProfile(userData.supabaseUrl, userData.supabaseKey, userData);
        
        if (!profileSuccess) {
            console.log('❌ Profile setup failed. You can set this up later.');
        }

        console.log('\\n🎉 Setup completed successfully!');
        console.log('\\nNext steps:');
        console.log('1. Run "npm start" to start the AI companion');
        console.log('2. Your AI companion will start in console mode');
        console.log('3. Later, run "npm run install-whatsapp" to add WhatsApp integration');
        console.log('\\nYour AI companion will start messaging you proactively!');

    } catch (error) {
        console.error('❌ Setup failed:', error);
    } finally {
        rl.close();
    }
}

if (require.main === module) {
    main();
}

module.exports = { setupEnvironment, setupDatabase, setupUserProfile };