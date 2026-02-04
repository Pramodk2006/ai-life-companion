const logger = require('../utils/logger');
const readline = require('readline');

// Try to load WhatsApp client, fall back to console if not available
let WhatsAppClient = null;
let SimpleWhatsAppClient = null;

// Always load the simple client as fallback
try {
    SimpleWhatsAppClient = require('./whatsapp-simple');
} catch (error) {
    logger.error('❌ Simple WhatsApp client not available');
}

// Try to load the full WhatsApp client, but don't fail if it's broken
try {
    WhatsAppClient = require('./whatsapp');
} catch (error) {
    logger.info('📱 Full WhatsApp client not available, using simple version');
}

class MessageClient {
    constructor(aiBrain, memoryManager) {
        this.ai = aiBrain;
        this.memory = memoryManager;
        this.rl = null;
        this.whatsapp = null;
        this.isReady = false;
        this.userPhone = process.env.USER_PHONE;
        this.platform = WhatsAppClient ? 'whatsapp' : 'console';
    }

    async initialize() {
        try {
            logger.info('📱 Initializing message client...');
            
            // Check if WhatsApp is explicitly disabled or if we're in cloud mode
            const whatsappDisabled = process.env.DISABLE_WHATSAPP === 'true';
            const cloudMode = process.env.CLOUD_MODE === 'true';
            const consoleDisabled = process.env.DISABLE_CONSOLE === 'true';
            
            if ((WhatsAppClient || SimpleWhatsAppClient) && this.userPhone && !whatsappDisabled) {
                try {
                    // In cloud mode, always use simple WhatsApp client for logging
                    if (SimpleWhatsAppClient && cloudMode) {
                        logger.info('🌐 Cloud mode: Using WhatsApp simulation for logging...');
                        this.whatsapp = new SimpleWhatsAppClient(this.ai, this.memory);
                        await this.whatsapp.initialize();
                        this.platform = 'whatsapp_simulation';
                        logger.info('✅ Cloud WhatsApp simulation client ready!');
                    }
                } catch (whatsappError) {
                    logger.warn('❌ WhatsApp initialization failed, falling back to console:', whatsappError.message);
                    this.whatsapp = null;
                    this.platform = 'console';
                    if (!consoleDisabled) {
                        this.setupConsoleInterface();
                    }
                    logger.info('✅ Console client ready (WhatsApp failed)');
                }
            } else {
                // Fallback to console only if not disabled
                if (!consoleDisabled) {
                    this.platform = 'console';
                    this.setupConsoleInterface();
                    let reason = 'using console mode';
                    if (whatsappDisabled) reason = 'WhatsApp disabled';
                    else if (!WhatsAppClient && !SimpleWhatsAppClient) reason = 'packages not available';
                    else if (!this.userPhone) reason = 'phone number not configured';
                    logger.info(`✅ Console client ready (${reason})`);
                } else {
                    // Cloud mode without console
                    this.platform = 'cloud';
                    logger.info('🌐 Cloud mode: Console disabled, API-only mode');
                }
            }
            
            this.isReady = true;
            this.sendStartupMessage();
            
        } catch (error) {
            logger.error('❌ Failed to initialize message client:', error);
            throw error;
        }
    }

    setupConsoleInterface() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '🤖 AI Companion > '
        });

        this.rl.on('line', async (input) => {
            await this.handleIncomingMessage({
                body: input.trim(),
                from: 'user',
                timestamp: Date.now(),
                type: 'text',
                platform: 'console'
            });
            
            this.rl.prompt();
        });

        this.rl.on('close', () => {
            logger.info('👋 Goodbye!');
        });

        this.rl.prompt();
    }

    async handleIncomingMessage(message) {
        try {
            if (!message.body || message.body.length === 0) return;

            const messageText = message.body;
            const timestamp = new Date(message.timestamp);

            logger.info(`📥 Message: ${messageText}`);

            // Store the message in memory
            await this.memory.storeMessage({
                sender: 'user',
                content: messageText,
                timestamp: timestamp,
                messageType: message.type,
                platform: message.platform || 'console'
            });

            // Generate AI response
            const response = await this.ai.generateResponse({
                message: messageText,
                sender: 'user',
                timestamp: timestamp,
                platform: message.platform || 'console',
                context: await this.memory.getRecentContext()
            });

            if (response) {
                await this.sendMessage(response);
                
                // Store AI response in memory
                await this.memory.storeMessage({
                    sender: 'ai',
                    content: response,
                    timestamp: new Date(),
                    messageType: 'text',
                    platform: message.platform || 'console'
                });
            }

        } catch (error) {
            logger.error('❌ Error handling incoming message:', error);
        }
    }

    async sendMessage(text) {
        try {
            if (!this.isReady) {
                logger.warn('📴 Message client not ready');
                return false;
            }

            // Console output
            console.log(`\\n🤖: ${text}\\n`);
            logger.info(`📤 AI Response: ${text.substring(0, 50)}...`);
            
            return true;
        } catch (error) {
            logger.error('❌ Error sending message:', error);
            return false;
        }
    }

    async sendProactiveMessage(text) {
        if (this.whatsapp) {
            // Send to WhatsApp
            logger.info(`🔔 Proactive WhatsApp message: ${text}`);
            return await this.whatsapp.sendProactiveMessage(text);
        } else {
            // Send to console
            logger.info(`🔔 Proactive message: ${text}`);
            return await this.sendMessage(`[Proactive] ${text}`);
        }
    }

    async sendStartupMessage() {
        const startupText = `🤖 Your AI companion is now active!

I'm here to help you reach your goals, remember everything we discuss, and check in with you regularly.

You can talk to me about anything - I'll remember it all and help keep you accountable. Let's start by telling me what you're working on today!

Type 'help' for commands or just start chatting!`;
        
        setTimeout(() => {
            this.sendMessage(startupText);
        }, 1000);
    }

    async destroy() {
        if (this.rl) {
            this.rl.close();
        }
        logger.info('🛑 Message client destroyed');
    }

    getStatus() {
        return {
            ready: this.isReady,
            platform: this.platform,
            userPhone: this.userPhone || 'not configured'
        };
    }
}

module.exports = MessageClient;