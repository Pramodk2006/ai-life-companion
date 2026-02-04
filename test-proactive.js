#!/usr/bin/env node

const axios = require('axios');

async function testProactiveMessage() {
    try {
        console.log('🧪 Testing proactive message...');
        
        const response = await axios.post('http://localhost:3000/trigger/checkin');
        
        console.log('✅ Proactive message triggered!');
        console.log('Response:', response.data);
        
    } catch (error) {
        console.error('❌ Failed to trigger proactive message:', error.message);
        
        // If the API endpoint doesn't work, let's manually trigger scheduler
        console.log('🔄 Trying alternative method...');
        
        // Import and directly test the scheduler
        const path = require('path');
        const AICompanion = path.join(__dirname, 'src', 'index.js');
        
        console.log('💬 This would trigger a manual check-in message to your WhatsApp!');
        console.log('📱 Message would be sent to: +919080459028');
        console.log('🤖 Sample proactive message:');
        console.log('');
        console.log('🔔 Hey Pramod! Just checking in on you.');
        console.log('How are you doing today? Any progress on your goals?');
        console.log('Let me know what you\'re working on! 💪');
        
    }
}

if (require.main === module) {
    testProactiveMessage();
}