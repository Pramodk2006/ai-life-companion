const cron = require('node-cron');
const logger = require('../utils/logger');

class Scheduler {
    constructor(messageClient, aiBrain, memoryManager) {
        this.messaging = messageClient;
        this.ai = aiBrain;
        this.memory = memoryManager;
        this.jobs = new Map();
        this.isRunning = false;
    }

    async initialize() {
        try {
            logger.info('⏰ Initializing scheduler...');
            
            this.setupScheduledJobs();
            this.isRunning = true;
            
            logger.info('✅ Scheduler initialized with proactive messaging');
            
        } catch (error) {
            logger.error('❌ Failed to initialize scheduler:', error);
            throw error;
        }
    }

    setupScheduledJobs() {
        // Morning check-in (9 AM)
        const morningTime = process.env.MORNING_CHECKIN_TIME || '09:00';
        const [morningHour, morningMinute] = morningTime.split(':');
        
        const morningJob = cron.schedule(
            `${morningMinute} ${morningHour} * * *`,
            () => this.triggerMorningCheckin(),
            { scheduled: false }
        );
        
        this.jobs.set('morning', morningJob);
        morningJob.start();
        logger.info(`🌅 Morning check-in scheduled for ${morningTime}`);

        // Evening reflection (9 PM)
        const eveningTime = process.env.EVENING_CHECKIN_TIME || '21:00';
        const [eveningHour, eveningMinute] = eveningTime.split(':');
        
        const eveningJob = cron.schedule(
            `${eveningMinute} ${eveningHour} * * *`,
            () => this.triggerEveningReflection(),
            { scheduled: false }
        );
        
        this.jobs.set('evening', eveningJob);
        eveningJob.start();
        logger.info(`🌙 Evening reflection scheduled for ${eveningTime}`);

        // Hourly check-ins (if enabled)
        if (process.env.HOURLY_CHECKINS_ENABLED === 'true') {
            const hourlyJob = cron.schedule(
                '0 * * * *',
                () => this.triggerHourlyCheckin(),
                { scheduled: false }
            );
            
            this.jobs.set('hourly', hourlyJob);
            hourlyJob.start();
            logger.info('⏱️ Hourly check-ins enabled');
        }

        // Silence detection (every 4 hours)
        const silenceJob = cron.schedule(
            '0 */4 * * *',
            () => this.checkForSilence(),
            { scheduled: false }
        );
        
        this.jobs.set('silence', silenceJob);
        silenceJob.start();
        logger.info('🔇 Silence detection enabled');

        // Weekly goal review (Sunday 8 PM)
        const weeklyJob = cron.schedule(
            '0 20 * * 0',
            () => this.triggerWeeklyReview(),
            { scheduled: false }
        );
        
        this.jobs.set('weekly', weeklyJob);
        weeklyJob.start();
        logger.info('📊 Weekly goal review scheduled');
    }

    async triggerMorningCheckin() {
        try {
            logger.info('🌅 Triggering morning check-in');
            
            const activeGoals = await this.memory.getActiveGoals();
            const morningMessages = this.generateMorningMessages(activeGoals);
            
            const message = this.selectRandomMessage(morningMessages);
            await this.messaging.sendProactiveMessage(message);
            
            await this.memory.storeMessage({
                sender: 'ai',
                content: message,
                timestamp: new Date(),
                messageType: 'proactive_morning',
                platform: 'scheduler'
            });
            
        } catch (error) {
            logger.error('❌ Error in morning check-in:', error);
        }
    }

    async triggerEveningReflection() {
        try {
            logger.info('🌙 Triggering evening reflection');
            
            const recentContext = await this.memory.getRecentContext(5);
            const eveningMessages = this.generateEveningMessages(recentContext);
            
            const message = this.selectRandomMessage(eveningMessages);
            await this.messaging.sendProactiveMessage(message);
            
            await this.memory.storeMessage({
                sender: 'ai',
                content: message,
                timestamp: new Date(),
                messageType: 'proactive_evening',
                platform: 'scheduler'
            });
            
        } catch (error) {
            logger.error('❌ Error in evening reflection:', error);
        }
    }

    async triggerHourlyCheckin() {
        try {
            const hour = new Date().getHours();
            
            // Skip sleep hours (11 PM - 7 AM)
            if (hour >= 23 || hour <= 7) return;
            
            // Skip if user was recently active (last 2 hours)
            const lastInteraction = await this.memory.getLastInteractionTime();
            if (lastInteraction && Date.now() - lastInteraction.getTime() < 2 * 60 * 60 * 1000) {
                return;
            }
            
            logger.info('⏱️ Triggering hourly check-in');
            
            const hourlyMessages = [
                "Quick check-in: How are you doing with your main goal today?",
                "What's occupying your mind right now?",
                "Making progress on what matters most today?",
                "How's your energy level? Staying focused?",
                "Just checking in - anything you want to share about today?"
            ];
            
            const message = this.selectRandomMessage(hourlyMessages);
            await this.messaging.sendProactiveMessage(`⏰ ${message}`);
            
        } catch (error) {
            logger.error('❌ Error in hourly check-in:', error);
        }
    }

    async checkForSilence() {
        try {
            const lastInteraction = await this.memory.getLastInteractionTime();
            
            if (!lastInteraction) return;
            
            const hoursSinceLastMessage = (Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60);
            
            let message = null;
            
            if (hoursSinceLastMessage >= 72) {
                message = "Hey, I haven't heard from you in a few days. No pressure, but I'm here when you're ready to talk. Hope you're doing well! 💙";
            } else if (hoursSinceLastMessage >= 48) {
                message = "Just wanted to check in - you've been quiet for a couple days. Everything okay? I'm here if you need to talk about anything.";
            } else if (hoursSinceLastMessage >= 24) {
                message = "Haven't heard from you today. How did things go? I'm curious about your progress!";
            }
            
            if (message) {
                logger.info(`🔇 Silence detected (${Math.round(hoursSinceLastMessage)} hours) - sending check-in`);
                await this.messaging.sendProactiveMessage(message);
                
                await this.memory.storeMessage({
                    sender: 'ai',
                    content: message,
                    timestamp: new Date(),
                    messageType: 'proactive_silence',
                    platform: 'scheduler'
                });
            }
            
        } catch (error) {
            logger.error('❌ Error in silence detection:', error);
        }
    }

    async triggerWeeklyReview() {
        try {
            logger.info('📊 Triggering weekly review');
            
            const message = `🗓️ Week's almost over! Time for a quick review:

1. What was your biggest win this week?
2. What challenged you the most?
3. What do you want to focus on next week?

I love hearing about your progress and struggles. Both help us learn! 📈`;
            
            await this.messaging.sendProactiveMessage(message);
            
            await this.memory.storeMessage({
                sender: 'ai',
                content: message,
                timestamp: new Date(),
                messageType: 'proactive_weekly',
                platform: 'scheduler'
            });
            
        } catch (error) {
            logger.error('❌ Error in weekly review:', error);
        }
    }

    generateMorningMessages(activeGoals) {
        const baseMessages = [
            "Good morning! ☀️ What's the one thing that would make today a win?",
            "Morning! What are you tackling first today?",
            "New day, fresh start! What's your main focus today?",
            "Good morning! Ready to make today count?",
            "Morning check-in: What's most important on your agenda today?"
        ];
        
        if (activeGoals && activeGoals.length > 0) {
            const goalMessages = activeGoals.map(goal => 
                `Morning! How will you move forward on "${goal.title}" today?`
            );
            return [...baseMessages, ...goalMessages];
        }
        
        return baseMessages;
    }

    generateEveningMessages(recentContext) {
        const baseMessages = [
            "Evening reflection time! 🌅 How did today go?",
            "End of the day - what's on your mind about today?",
            "Time to wind down. Tell me about your day!",
            "Evening check-in: What happened today that mattered?",
            "How are you feeling about what you accomplished today?"
        ];
        
        if (recentContext && recentContext.length > 0) {
            const contextMessages = [
                "How did that thing we talked about go today?",
                "Did you make progress on what we discussed?",
                "I'm curious how today went after our conversation!"
            ];
            return [...baseMessages, ...contextMessages];
        }
        
        return baseMessages;
    }

    selectRandomMessage(messages) {
        return messages[Math.floor(Math.random() * messages.length)];
    }

    async triggerCheckin() {
        const currentHour = new Date().getHours();
        
        if (currentHour < 12) {
            await this.triggerMorningCheckin();
        } else if (currentHour < 18) {
            await this.triggerHourlyCheckin();
        } else {
            await this.triggerEveningReflection();
        }
    }

    stop() {
        logger.info('🛑 Stopping scheduler...');
        
        this.jobs.forEach((job, name) => {
            job.stop();
            logger.debug(`Stopped ${name} job`);
        });
        
        this.isRunning = false;
        logger.info('✅ Scheduler stopped');
    }

    getStatus() {
        return {
            running: this.isRunning,
            activeJobs: Array.from(this.jobs.keys())
        };
    }
}

module.exports = Scheduler;