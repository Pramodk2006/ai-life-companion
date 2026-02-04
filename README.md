# AI Companion - Personal Life Coach System

A comprehensive personal AI companion that acts as your friend, mentor, tutor, and accountability partner. It remembers everything, tracks your goals, sends proactive messages, and integrates with your digital life.

## Features

- **Permanent Memory**: Remembers all conversations and experiences permanently
- **Proactive Engagement**: Sends timely check-ins, motivation, and accountability messages
- **Multi-Modal Personality**: Friend, mentor, tutor, and accountability partner modes
- **Goal Tracking**: Helps set, track, and achieve personal and professional goals
- **Social Integration**: Monitors GitHub, LeetCode, and other platforms for progress
- **Intelligent Scheduling**: Morning check-ins, evening reflections, silence detection
- **Free & Private**: Runs on free tiers, your data stays secure

## Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier)
- Optional: OpenAI API key for advanced AI features

### 2. Installation

```bash
git clone <this-repo>
cd ai-companion
npm install
```

### 3. Setup

```bash
npm run setup
```

Follow the interactive setup to configure:
- Your personal information
- Supabase database connection
- Social media profiles to monitor
- AI preferences

### 4. Run

```bash
npm start
```

The AI companion starts in console mode. You can chat with it directly in the terminal.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Messaging     │    │    AI Brain     │    │  Memory Manager │
│   (Console/     │◄──►│   (OpenAI +     │◄──►│   (Supabase +   │
│   WhatsApp)     │    │   Fallbacks)    │    │   PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Scheduler     │    │ Profile Scraper │    │   Goal Tracker  │
│  (Cron Jobs)    │    │ (GitHub, etc.)  │    │  (Progress DB)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Components

- **Memory Manager**: Permanent conversation storage with smart retrieval
- **AI Brain**: Context-aware responses with multiple personality modes
- **Message Client**: Handles communication (Console, WhatsApp, etc.)
- **Scheduler**: Proactive messaging and check-ins
- **Profile Scraper**: Monitors external activity (GitHub, LeetCode)

## How It Works

### Daily Interaction Flow

1. **Morning Check-in** (9 AM): "What's your main focus today?"
2. **Activity Monitoring**: Tracks your GitHub commits, LeetCode progress
3. **Contextual Responses**: Remembers your goals and past conversations
4. **Evening Reflection** (9 PM): "How did today go? What did you learn?"
5. **Silence Detection**: Gentle check-ins if you've been quiet

### Personality Modes

- **Friend Mode**: Supportive, understanding, celebrates wins
- **Mentor Mode**: Wisdom, long-term perspective, tough questions
- **Tutor Mode**: Teaching, explanations, skill development
- **Accountability Mode**: Direct, pushes for progress, no excuses

## WhatsApp Integration (Optional)

To add WhatsApp integration:

```bash
npm run install-whatsapp
```

This installs WhatsApp Web automation. **Warning**: WhatsApp automation violates their Terms of Service. Use for personal experimentation only.

## Configuration

### Environment Variables

```bash
# Core
USER_NAME=Your Name
USER_PHONE=+1234567890
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# AI (Optional)
OPENAI_API_KEY=sk-your-openai-key
AI_MODEL=gpt-3.5-turbo

# Scheduling
MORNING_CHECKIN_TIME=09:00
EVENING_CHECKIN_TIME=21:00
HOURLY_CHECKINS_ENABLED=false

# Social Profiles
GITHUB_USERNAME=your_github
LEETCODE_USERNAME=your_leetcode
```

### Database Schema

The system uses these Supabase tables:
- `conversations`: All messages with timestamps
- `goals`: Personal goals and objectives
- `goal_progress`: Progress tracking and mood
- `user_profile`: Your preferences and social profiles

## API Endpoints

```bash
GET  /health              # System status
GET  /memory/stats        # Memory and conversation stats
POST /trigger/checkin     # Manual proactive message
POST /scrape/profiles     # Force profile scraping
```

## Free Tier Strategy

- **Supabase**: 500MB free database
- **Node.js hosting**: Railway/Render free tiers
- **AI**: Fallback responses + optional OpenAI for complex tasks
- **Scraping**: Public APIs and rate-limited requests

## Privacy & Security

- All data encrypted at rest in Supabase
- No data shared with third parties
- Local processing when possible
- User controls all data deletion
- Transparent about what's remembered

## Troubleshooting

### Common Issues

1. **Database connection failed**
   - Check your Supabase URL and key
   - Ensure tables are created (see setup script)

2. **No proactive messages**
   - Check scheduler is running: `GET /health`
   - Verify environment variables for timing

3. **AI not responding**
   - Check OpenAI API key if using paid features
   - Fallback responses should still work

4. **Scraping not working**
   - GitHub API has rate limits
   - Check usernames are correct in profile

### Logs

Check `logs/combined.log` for detailed system behavior.

## Roadmap

- [ ] Mobile app interface
- [ ] Voice message support
- [ ] Advanced habit tracking
- [ ] Integration with more platforms
- [ ] Local LLM support (Ollama)
- [ ] Group goal tracking
- [ ] Export/import data

## Contributing

This is designed as a personal system. Fork and customize for your needs!

## Legal Notes

- WhatsApp automation violates their ToS - use at your own risk
- Respect API rate limits and terms of service
- Only scrape public, visible information
- This is for personal, non-commercial use

---

**Built for personal growth, accountability, and long-term goal achievement. Your AI companion that truly knows and supports you.**