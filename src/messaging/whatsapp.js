const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const logger = require('../utils/logger');

class WhatsAppClient {
    constructor(aiBrain, memoryManager) {
        this.client = null;
        this.ai = aiBrain;
        this.memory = memoryManager;
        this.isReady = false;
        this.userPhone = process.env.USER_PHONE;
    }

    async initialize() {
        try {
            logger.info('📱 Initializing WhatsApp client...');
            
            this.client = new Client({
                authStrategy: new LocalAuth({ clientId: 'ai-companion' }),
                puppeteer: { 
                    headless: false,  // Show browser for debugging
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-web-security',
                        '--disable-features=VizDisplayCompositor',
                        '--disable-dev-shm-usage',
                        '--no-first-run'
                    ],
                    timeout: 60000  // Increased timeout
                }
            });

            this.setupEventHandlers();
            
            logger.info('📱 Starting WhatsApp Web connection...');
            await this.client.initialize();
            
        } catch (error) {
            logger.error('❌ WhatsApp initialization failed:', error.message);
            throw error;
        }
    }

    setupEventHandlers() {
        // Connection loading
        this.client.on('loading_screen', (percent, message) => {
            logger.info(`📱 WhatsApp loading: ${percent}% - ${message}`);
        });

        // QR Code for scanning with your phone
        this.client.on('qr', (qr) => {
            logger.info('📱 WhatsApp QR Code generated!');
            logger.info('👆 Scan the QR code in the browser window with WhatsApp on your phone');
            qrcode.generate(qr, { small: true });
        });

        // Authentication success
        this.client.on('authenticated', () => {
            logger.info('✅ WhatsApp authenticated successfully!');
        });

        // Client ready
        this.client.on('ready', () => {
            this.isReady = true;
            logger.info('🎉 WhatsApp client connected to your phone!');
            this.sendStartupMessage();
        });

        // Disconnection
        this.client.on('disconnected', (reason) => {
            logger.warn('❌ WhatsApp disconnected:', reason);
            this.isReady = false;
        });

        // Incoming messages from YOU
        this.client.on('message', async (message) => {
            const contact = await message.getContact();
            const isFromUser = contact.number === this.userPhone?.replace(/\+/g, '');

            if (isFromUser && !message.fromMe) {
                await this.handleUserMessage(message);
            }
        });
    }

    async handleUserMessage(message) {
        const messageText = message.body;
        logger.info(`📥 WhatsApp message: ${messageText}`);

        // Store in memory
        await this.memory.storeMessage({
            sender: 'user',
            content: messageText,
            timestamp: new Date(),
            messageType: 'whatsapp',
            platform: 'whatsapp'
        });

        // Generate AI response
        const response = await this.ai.generateResponse({
            message: messageText,
            sender: 'user',
            platform: 'whatsapp'
        });

        if (response) {
            await this.sendMessage(message.from, response);
        }
    }

    async sendMessage(to, text) {
        if (!this.isReady) return false;
        
        await this.client.sendMessage(to, text);
        logger.info(`📤 Sent to WhatsApp: ${text.substring(0, 50)}...`);
        
        // Store AI response
        await this.memory.storeMessage({
            sender: 'ai',
            content: text,
            timestamp: new Date(),
            messageType: 'whatsapp',
            platform: 'whatsapp'
        });
        
        return true;
    }

    // THIS IS HOW PROACTIVE MESSAGING WORKS
    async sendProactiveMessage(text) {
        if (!this.userPhone || !this.isReady) {
            logger.warn('📴 WhatsApp not ready for proactive messaging');
            return false;
        }

        const chatId = `${this.userPhone.replace(/\+/g, '')}@c.us`;
        return await this.sendMessage(chatId, text);
    }

    async sendStartupMessage() {
        const startupText = `🤖 Your AI companion is now connected to WhatsApp!

I'll proactively message you:
• Every morning at 9 AM
• Every evening at 9 PM  
• When you've been quiet too long
• When I notice progress on your goals

You can chat with me anytime and I'll remember everything! 💭`;
        
        setTimeout(() => {
            this.sendProactiveMessage(startupText);
        }, 3000);
    }
}

module.exports = WhatsAppClient;