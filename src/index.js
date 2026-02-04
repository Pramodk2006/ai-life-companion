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
            process.exit(1);
        }
    }

    setupRoutes() {
        this.app.use(express.json());
        
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
    const companion = new AICompanion();
    await companion.initialize();
    await companion.start();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = AICompanion;