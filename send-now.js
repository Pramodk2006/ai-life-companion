const SimpleWhatsAppClient = require('./src/messaging/whatsapp-simple');
const logger = require('./src/utils/logger');

class MockMemory {
    async storeMessage(data) {
        logger.info(`💾 Message stored: ${data.sender} -> ${data.content.substring(0, 50)}...`);
    }
}

class MockAI {
    async generateResponse(message) {
        return "Thanks for your message! I'm here to help you stay motivated and reach your goals.";
    }
}

async function sendProactiveMessageNow() {
    console.log('\n🚀 SENDING PROACTIVE MESSAGE NOW...\n');
    
    try {
        const mockMemory = new MockMemory();
        const mockAI = new MockAI();
        const whatsapp = new SimpleWhatsAppClient(mockAI, mockMemory);
        
        await whatsapp.sendProactiveMessage(`Hey Pramod! 👋 

This is your AI companion checking in on you right now (${new Date().toLocaleTimeString()}).

How are you doing today? I wanted to reach out because:
• It's important to stay connected with your goals
• Regular check-ins help maintain motivation
• I'm here to support your progress

Quick questions:
🎯 What are you working on right now?
💪 How motivated are you feeling (1-10)?
📈 Any progress to celebrate today?

Remember, I'm here to help keep you accountable and motivated throughout your journey! 

Feel free to share anything on your mind - goals, challenges, wins, or just how you're feeling.

Your AI companion is actively supporting you! 🚀`);

        console.log('\n✅ PROACTIVE MESSAGE SENT SUCCESSFULLY!');
        console.log('📱 This message would now be on your WhatsApp at +919080459028');
        
    } catch (error) {
        console.error('❌ Error sending proactive message:', error);
    }
}

sendProactiveMessageNow();