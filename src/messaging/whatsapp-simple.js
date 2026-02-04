const logger = require('../utils/logger');

class SimpleWhatsAppClient {
    constructor(aiBrain, memoryManager) {
        this.ai = aiBrain;
        this.memory = memoryManager;
        this.isReady = false;
        this.userPhone = process.env.USER_PHONE;
    }

    async initialize() {
        logger.info('📱 Initializing Simple WhatsApp client...');
        
        // For now, simulate WhatsApp readiness after a short delay
        logger.info('📱 WhatsApp simulation mode - messages would be sent to your phone');
        logger.info(`📞 Configured phone: ${this.userPhone}`);
        
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        this.isReady = true;
        logger.info('✅ WhatsApp simulation client ready!');
        this.sendStartupMessage();
    }

    async sendMessage(message) {
        if (!this.isReady) {
            logger.warn('📱 WhatsApp not ready, message queued');
            return;
        }

        // Log what would be sent to WhatsApp
        logger.info(`📱➡️  [WHATSAPP SIMULATION] Would send to ${this.userPhone}:`);
        logger.info(`📱💬 ${message}`);
        
        // Store in memory that we sent a message
        await this.memory.storeMessage({
            sender: 'ai',
            content: message,
            platform: 'whatsapp_simulation',
            timestamp: new Date().toISOString(),
            messageType: 'text'
        });
    }

    async sendStartupMessage() {
        const startupMsg = `🤖 Your AI companion is now connected to WhatsApp! (SIMULATION MODE)

I'm ready to:
✅ Send you morning check-ins (9 AM)
✅ Evening reflections (9 PM) 
✅ Goal reminders
✅ Response to your messages

Reply to this message to test the connection!`;

        await this.sendMessage(startupMsg);
    }

    // Simulate receiving messages (for testing)
    simulateIncomingMessage(message) {
        if (!this.isReady) return;
        
        logger.info(`📱⬅️  [WHATSAPP SIMULATION] Received from ${this.userPhone}: ${message}`);
        this.handleIncomingMessage(message);
    }

    async handleIncomingMessage(message) {
        try {
            // Store the incoming message
            await this.memory.storeMessage({
                sender: 'user',
                content: message,
                platform: 'whatsapp_simulation',
                timestamp: new Date().toISOString(),
                messageType: 'text'
            });

            // Generate AI response
            const response = await this.ai.generateResponse(message, 'whatsapp');
            
            // Send response back
            await this.sendMessage(response);

        } catch (error) {
            logger.error('❌ Error handling WhatsApp message:', error);
            await this.sendMessage("Sorry, I had trouble processing your message. Please try again!");
        }
    }

    async sendProactiveMessage(message) {
        await this.sendMessage(`🔔 ${message}`);
    }
}

module.exports = SimpleWhatsAppClient;