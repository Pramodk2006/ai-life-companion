#!/usr/bin/env node

// Cloud deployment entry point for AI Companion
const AICompanion = require('./src/index');

async function startCloudMode() {
    console.log('🌐 Starting AI Companion in CLOUD MODE...');
    console.log('📡 24/7 Always-On Proactive Messaging Enabled');
    
    // Cloud mode - disable console interface, enable only messaging APIs
    process.env.CLOUD_MODE = 'true';
    process.env.DISABLE_CONSOLE = 'true';
    
    const companion = new AICompanion();
    
    try {
        await companion.initialize();
        console.log('\n✅ AI Companion deployed successfully!');
        console.log('🚀 System is now running 24/7 in the cloud');
        console.log('📱 Proactive messages will be sent to:', process.env.USER_PHONE);
        console.log('🕘 Schedule:');
        console.log('  🌅 Morning check-ins: 9:00 AM daily');
        console.log('  🌙 Evening reflections: 9:00 PM daily');
        console.log('  🔔 Silence detection: Every 4 hours');
        console.log('  📊 Weekly goal reviews');
        
    } catch (error) {
        console.error('❌ Failed to start AI Companion:', error.message);
        process.exit(1);
    }

    // Handle graceful shutdown for cloud deployments
    process.on('SIGTERM', async () => {
        console.log('🛑 Received SIGTERM, shutting down gracefully...');
        await companion.shutdown();
        process.exit(0);
    });

    process.on('SIGINT', async () => {
        console.log('🛑 Received SIGINT, shutting down gracefully...');
        await companion.shutdown();
        process.exit(0);
    });
}

if (require.main === module) {
    startCloudMode();
}