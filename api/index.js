import AICompanion from '../src/index.js';

let companion = null;

// Initialize companion once
async function initCompanion() {
    if (!companion) {
        try {
            console.log('🌐 Initializing AI Companion for serverless...');
            
            // Set environment for serverless
            process.env.CLOUD_MODE = 'true';
            process.env.DISABLE_CONSOLE = 'true';
            
            companion = new AICompanion();
            await companion.initialize();
            
            console.log('✅ AI Companion initialized for serverless');
        } catch (error) {
            console.error('❌ Failed to initialize AI Companion:', error);
            throw error;
        }
    }
    return companion;
}

// Serverless function handler
export default async function handler(req, res) {
    try {
        const comp = await initCompanion();
        
        // Handle different routes
        const { method, url } = req;
        
        if (method === 'GET' && url === '/') {
            return res.json({ 
                message: '🤖 AI Life Companion is running!',
                status: 'active',
                initialized: comp.isInitialized,
                endpoints: [
                    '/health',
                    '/memory/stats',
                    '/trigger/checkin',
                    '/scrape/profiles'
                ]
            });
        }
        
        if (method === 'GET' && url === '/favicon.ico') {
            res.status(204).end();
            return;
        }
        
        if (method === 'GET' && url === '/health') {
            return res.json({ status: 'ok', initialized: comp.isInitialized });
        }
        
        if (method === 'GET' && url === '/memory/stats') {
            const stats = await comp.memory.getStats();
            return res.json(stats);
        }
        
        if (method === 'POST' && url === '/trigger/checkin') {
            await comp.scheduler.triggerCheckin();
            return res.json({ success: true });
        }
        
        if (method === 'POST' && url === '/scrape/profiles') {
            const results = await comp.scraper.scrapeAllProfiles();
            return res.json(results);
        }
        
        // Default 404
        res.status(404).json({ error: 'Not found' });
        
    } catch (error) {
        console.error('❌ Serverless function error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
};