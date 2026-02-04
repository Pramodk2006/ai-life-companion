#!/usr/bin/env node

const AICompanion = require('./src/index');

async function startConsoleMode() {
    console.log('🚀 Starting AI Companion in CONSOLE MODE (without WhatsApp)...');
    
    // Temporarily disable WhatsApp by setting environment variable
    process.env.DISABLE_WHATSAPP = 'true';
    
    const companion = new AICompanion();
    
    try {
        await companion.initialize();
        console.log('\n✅ AI Companion started successfully in console mode!');
        console.log('💬 You can now chat with your AI companion here');
        console.log('📱 To enable WhatsApp later, restart with: npm start');
    } catch (error) {
        console.error('❌ Failed to start AI Companion:', error.message);
        process.exit(1);
    }

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n👋 Shutting down AI Companion...');
        await companion.shutdown();
        process.exit(0);
    });
}

async function main() {
    startConsoleMode();
}

if (require.main === module) {
    main();
}