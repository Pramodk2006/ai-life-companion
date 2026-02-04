# 🚀 Deploy AI Companion to Railway (24/7 Cloud)

## Quick Deploy Steps:

### 1. **Create Railway Account**
- Go to [railway.app](https://railway.app)
- Sign up with GitHub
- It's free for hobby projects

### 2. **Deploy Your Project**

**Option A: Direct Deploy (Recommended)**
- Click: [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)
- Connect your GitHub account
- Upload this project folder

**Option B: GitHub Deploy**
- Push this project to GitHub
- Connect Railway to your GitHub repo
- Railway auto-deploys on code changes

### 3. **Set Environment Variables in Railway**
Go to Railway project → Variables tab and add:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anonymous_key
OPENAI_API_KEY=your_openai_api_key_optional
USER_PHONE=your_phone_number_with_country_code
USER_NAME=your_name
GITHUB_USERNAME=your_github_username
LEETCODE_USERNAME=your_leetcode_username
PORT=3000
NODE_ENV=production
CLOUD_MODE=true
DISABLE_CONSOLE=true
```

### 4. **Deploy & Monitor**
- Railway automatically builds and deploys
- Check logs in Railway dashboard
- Your AI companion runs 24/7!

## 🎯 **What Happens After Deployment:**

✅ **24/7 Operation** - Runs even when your computer is off
✅ **Morning Messages** - 9 AM daily check-ins  
✅ **Evening Reflections** - 9 PM daily summaries
✅ **Silence Detection** - Checks if you're inactive for 4+ hours
✅ **Goal Tracking** - Persistent motivation and accountability
✅ **Activity Monitoring** - Tracks your GitHub/LeetCode progress

## 🔧 **Alternative Cloud Platforms:**

### Render.com
- Free tier available
- Easy deployment
- Good for Node.js apps

### Vercel
- Great for frontend + API
- Free tier
- Excellent performance

### Heroku
- Classic choice
- Easy deployment
- Free tier limited

## 📱 **Getting Messages on Your Phone:**

Once deployed, you can add:
1. **Telegram Bot** - Free, reliable notifications
2. **Email Notifications** - Simple and effective  
3. **SMS Integration** - Direct to your phone
4. **WhatsApp Business API** - Official WhatsApp (paid)

Your AI companion will be **always watching and supporting you** from the cloud! 🤖✨