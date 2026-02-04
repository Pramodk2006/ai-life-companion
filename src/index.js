require('dotenv').config();
const express = require('express');
const logger = require('./utils/logger');
const MemoryManager = require('./memory/manager');
const AIBrain = require('./ai/brain');
const MessageClient = require('./messaging/client');
const Scheduler = require('./scheduler/scheduler');
const ProfileScraper = require('./scraping/scraper');

class AICompanion {
    constructor() {
        this.app = express();
        this.memory = null;
        this.ai = null;
        this.messaging = null;
        this.scheduler = null;
        this.scraper = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            logger.info('🚀 Starting AI Companion System...');
            
            // Check critical environment variables
            this.checkEnvironment();
            
            // Initialize core components
            this.memory = new MemoryManager();
            await this.memory.initialize();
            
            this.ai = new AIBrain(this.memory);
            await this.ai.initialize();
            
            this.messaging = new MessageClient(this.ai, this.memory);
            await this.messaging.initialize();
            
            this.scheduler = new Scheduler(this.messaging, this.ai, this.memory);
            await this.scheduler.initialize();
            
            this.scraper = new ProfileScraper(this.memory);
            
            this.setupRoutes();
            this.isInitialized = true;
            
            logger.info('✅ AI Companion System initialized successfully');
            return this;
        } catch (error) {
            logger.error('❌ Failed to initialize AI Companion:', error);
            console.error('❌ Detailed error:', error);
            throw error; // Don't process.exit here, let the caller handle it
        }
    }

    checkEnvironment() {
        const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
        const missing = required.filter(key => !process.env[key]);
        
        if (missing.length > 0) {
            const error = `Missing required environment variables: ${missing.join(', ')}`;
            logger.error('❌ Environment check failed:', error);
            console.error('❌ Environment check failed:', error);
            console.error('💡 Please set these environment variables in your deployment platform');
            throw new Error(error);
        }
        
        const optional = ['OPENAI_API_KEY', 'USER_NAME', 'USER_PHONE'];
        const missingOptional = optional.filter(key => !process.env[key]);
        
        if (missingOptional.length > 0) {
            logger.warn(`⚠️  Optional environment variables not set: ${missingOptional.join(', ')}`);
            console.warn(`⚠️  Optional environment variables not set: ${missingOptional.join(', ')}`);
        }
        
        logger.info('✅ Environment variables validated');
    }

    setupRoutes() {
        this.app.use(express.json());
        
        // Root route for web browsers
        this.app.get('/', (req, res) => {
            res.json({ 
                message: '🤖 AI Life Companion is running!',
                status: 'active',
                initialized: this.isInitialized,
                endpoints: [
                    '/health',
                    '/memory/stats',
                    '/trigger/checkin',
                    '/scrape/profiles'
                ]
            });
        });
        
        // Favicon route (prevents 404s)
        this.app.get('/favicon.ico', (req, res) => {
            res.status(204).end(); // No content, just prevent the error
        });
        
        // Global error handler
        this.app.use((error, req, res, next) => {
            logger.error('Unhandled route error:', error);
            res.status(500).json({ 
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
            });
        });
        
        this.app.get('/health', (req, res) => {
            res.json({ status: 'ok', initialized: this.isInitialized });
        });
        
        this.app.get('/memory/stats', async (req, res) => {
            try {
                const stats = await this.memory.getStats();
                res.json(stats);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        
        this.app.post('/trigger/checkin', async (req, res) => {
            try {
                await this.scheduler.triggerCheckin();
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
        
        this.app.post('/scrape/profiles', async (req, res) => {
            try {
                const results = await this.scraper.scrapeAllProfiles();
                res.json(results);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }

    async start() {
        const port = process.env.PORT || 3000;
        
        this.app.listen(port, () => {
            logger.info(`🌐 Server running on port ${port}`);
            logger.info('📱 AI Companion active and ready!');
        });
        
        process.on('SIGINT', async () => {
            logger.info('🛑 Shutting down gracefully...');
            if (this.messaging) await this.messaging.destroy();
            if (this.scheduler) this.scheduler.stop();
            process.exit(0);
        });
    }
}

async function main() {
    try {
        const companion = new AICompanion();
        await companion.initialize();
        await companion.start();
    } catch (error) {
        logger.error('❌ Failed to start AI Companion:', error);
        console.error('❌ Failed to start AI Companion:', error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

if (require.main === module) {
    main().catch((error) => {
        console.error('❌ Main function failed:', error);
        process.exit(1);
    });
}

module.exports = AICompanion;