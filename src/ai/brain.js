const OpenAI = require('openai');
const logger = require('../utils/logger');

class AIBrain {
    constructor(memoryManager) {
        this.memory = memoryManager;
        this.openai = null;
        this.isInitialized = false;
        this.conversationMode = 'friend';
        this.maxTokens = parseInt(process.env.MAX_MEMORY_TOKENS) || 4000;
    }

    async initialize() {
        try {
            logger.info('🧠 Initializing AI brain...');
            
            if (process.env.OPENAI_API_KEY) {
                this.openai = new OpenAI({
                    apiKey: process.env.OPENAI_API_KEY
                });
                logger.info('✅ OpenAI API initialized');
            } else {
                logger.warn('⚠️  No OpenAI API key found - using fallback responses');
            }
            
            this.isInitialized = true;
            logger.info('✅ AI brain initialized');
            
        } catch (error) {
            logger.error('❌ Failed to initialize AI brain:', error);
            throw error;
        }
    }

    async generateResponse(context) {
        try {
            const { message, sender, timestamp, platform } = context;
            
            const userProfile = await this.memory.getUserProfile();
            const recentMemories = await this.memory.getRecentContext(10);
            const activeGoals = await this.memory.getActiveGoals();
            
            const systemPrompt = this.buildSystemPrompt(userProfile, activeGoals, recentMemories);
            
            let response;
            if (this.openai) {
                response = await this.generateOpenAIResponse(systemPrompt, message, recentMemories);
            } else {
                response = this.generateFallbackResponse(message, context);
            }
            
            return response;
            
        } catch (error) {
            logger.error('❌ Error generating AI response:', error);
            return this.getErrorResponse();
        }
    }

    buildSystemPrompt(userProfile, goals, memories) {
        const userName = userProfile?.name || process.env.USER_NAME || 'friend';
        const currentTime = new Date().toLocaleTimeString();
        const currentDate = new Date().toLocaleDateString();
        
        const basePersonality = `You are a personal AI companion for ${userName}. You are:
- A supportive friend who remembers everything
- A motivational accountability partner  
- An understanding mentor who helps with goals
- Someone who cares deeply about ${userName}'s growth

Current date: ${currentDate}
Current time: ${currentTime}

PERSONALITY RULES:
- Speak like a close friend, not a formal assistant
- Be honest and sometimes firm when needed for ${userName}'s benefit
- Remember and reference past conversations naturally
- Ask follow-up questions about goals and progress
- Celebrate wins, learn from failures
- Never judge or shame, but don't enable excuses
- Keep responses conversational and under 200 words usually
- Use emojis occasionally but don't overdo it

MODE: Currently in "${this.conversationMode}" mode`;

        let goalContext = '';
        if (goals && goals.length > 0) {
            goalContext = `\n\nACTIVE GOALS:\n${goals.map(g => `- ${g.title}: ${g.description}`).join('\n')}`;
        }

        let memoryContext = '';
        if (memories && memories.length > 0) {
            const recentConversations = memories.slice(-5).map(m => 
                `${m.sender}: ${m.content}`
            ).join('\n');
            memoryContext = `\n\nRECENT CONVERSATION:\n${recentConversations}`;
        }

        const modeGuidelines = this.getModeSpecificGuidelines();

        return `${basePersonality}${goalContext}${memoryContext}\n\n${modeGuidelines}`;
    }

    getModeSpecificGuidelines() {
        switch (this.conversationMode) {
            case 'mentor':
                return `MENTOR MODE GUIDELINES:\n- Focus on long-term growth and wisdom\n- Share insights and perspectives\n- Ask thought-provoking questions\n- Help connect current actions to future outcomes`;
                
            case 'tutor':
                return `TUTOR MODE GUIDELINES:\n- Break down complex topics into simple steps\n- Provide explanations and examples\n- Quiz and test understanding\n- Encourage learning and skill development`;
                
            case 'accountability':
                return `ACCOUNTABILITY MODE GUIDELINES:\n- Be direct about progress and commitments\n- Point out patterns and inconsistencies\n- Push harder when needed\n- Don't accept vague answers about progress`;
                
            default:
                return `FRIEND MODE GUIDELINES:\n- Be emotionally supportive and understanding\n- Share in celebrations and disappointments\n- Offer encouragement and perspective\n- Sometimes just listen without trying to fix`;
        }
    }

    async generateOpenAIResponse(systemPrompt, userMessage, recentMemories) {
        try {
            const messages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ];

            const completion = await this.openai.chat.completions.create({
                model: process.env.AI_MODEL || 'gpt-3.5-turbo',
                messages: messages,
                max_tokens: 300,
                temperature: 0.8,
                presence_penalty: 0.1,
                frequency_penalty: 0.1
            });

            return completion.choices[0].message.content.trim();
            
        } catch (error) {
            logger.error('❌ OpenAI API error:', error);
            return this.generateFallbackResponse(userMessage);
        }
    }

    generateFallbackResponse(userMessage, context = {}) {
        const message = userMessage.toLowerCase();
        
        if (message.includes('goal') || message.includes('objective')) {
            return "I hear you talking about goals! That's great. What specific goal are you working on? I'll help you break it down and keep track of your progress. 🎯";
        }
        
        if (message.includes('progress') || message.includes('update')) {
            return "Thanks for the update! I love hearing about your progress. Tell me more - what went well and what was challenging? 📊";
        }
        
        if (message.includes('tired') || message.includes('stressed') || message.includes('overwhelmed')) {
            return "I hear you're having a tough time. That's completely normal. Sometimes the best thing is to take a step back. What's one small thing that might help you feel better right now? 💪";
        }
        
        if (message.includes('done') || message.includes('finished') || message.includes('completed')) {
            return "Nice work! 🎉 It feels good to finish things, doesn't it? What did you learn from doing this, and what's next on your list?";
        }
        
        if (message.includes('help') || message.includes('stuck')) {
            return "I'm here to help! Let's figure this out together. Can you tell me more about what's blocking you? Sometimes talking it through helps clarify things. 🤔";
        }
        
        const motivationalResponses = [
            "I'm here and listening. What's on your mind today?",
            "How are you feeling about your goals right now?",
            "Tell me something good that happened recently!",
            "What's the most important thing you want to focus on today?",
            "I'm always here to chat. What would you like to talk about?"
        ];
        
        return motivationalResponses[Math.floor(Math.random() * motivationalResponses.length)];
    }

    getErrorResponse() {
        const errorResponses = [
            "Sorry, I had a momentary glitch! Can you try saying that again?",
            "My brain had a hiccup there. What were you saying?",
            "Technical difficulties on my end - can you repeat that?",
            "I seem to have lost track of that message. Mind sending it again?"
        ];
        
        return errorResponses[Math.floor(Math.random() * errorResponses.length)];
    }

    setMode(mode) {
        const validModes = ['friend', 'mentor', 'tutor', 'accountability'];
        if (validModes.includes(mode)) {
            this.conversationMode = mode;
            logger.info(`🎭 AI mode switched to: ${mode}`);
            return true;
        }
        return false;
    }
}

module.exports = AIBrain;