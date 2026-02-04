const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

class MemoryManager {
    constructor() {
        this.supabase = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            logger.info('🧠 Initializing memory manager...');
            
            const supabaseUrl = process.env.SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_ANON_KEY;
            
            if (!supabaseUrl || !supabaseKey) {
                throw new Error('Supabase credentials not found in environment variables');
            }
            
            this.supabase = createClient(supabaseUrl, supabaseKey);
            await this.testConnection();
            
            this.isInitialized = true;
            logger.info('✅ Memory manager initialized');
            
        } catch (error) {
            logger.error('❌ Failed to initialize memory manager:', error);
            throw error;
        }
    }

    async testConnection() {
        try {
            const { data, error } = await this.supabase
                .from('conversations')
                .select('count', { count: 'exact', head: true });
            
            if (error && error.code !== 'PGRST204') {
                throw error;
            }
            logger.info('✅ Database connection successful');
        } catch (error) {
            logger.warn('⚠️  Database tables may not exist yet. Please run setup script.');
        }
    }

    async storeMessage(messageData) {
        try {
            const { data, error } = await this.supabase
                .from('conversations')
                .insert([{
                    sender: messageData.sender,
                    content: messageData.content,
                    timestamp: messageData.timestamp || new Date().toISOString(),
                    message_type: messageData.messageType || 'text',
                    platform: messageData.platform || 'console',
                    created_at: new Date().toISOString()
                }]);

            if (error) throw error;
            logger.debug(`💾 Stored ${messageData.sender} message`);
            return data;
        } catch (error) {
            logger.error('❌ Error storing message:', error);
            throw error;
        }
    }

    async getRecentContext(limit = 20) {
        try {
            const { data, error } = await this.supabase
                .from('conversations')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data.reverse();
        } catch (error) {
            logger.error('❌ Error getting recent context:', error);
            return [];
        }
    }

    async storeGoal(goalData) {
        try {
            const { data, error } = await this.supabase
                .from('goals')
                .insert([{
                    title: goalData.title,
                    description: goalData.description,
                    status: goalData.status || 'active',
                    priority: goalData.priority || 'medium',
                    deadline: goalData.deadline,
                    created_at: new Date().toISOString()
                }]);

            if (error) throw error;
            logger.info(`🎯 Stored goal: ${goalData.title}`);
            return data;
        } catch (error) {
            logger.error('❌ Error storing goal:', error);
            throw error;
        }
    }

    async getActiveGoals() {
        try {
            const { data, error } = await this.supabase
                .from('goals')
                .select('*')
                .eq('status', 'active')
                .order('priority', { ascending: true });

            if (error) throw error;
            return data;
        } catch (error) {
            logger.error('❌ Error getting active goals:', error);
            return [];
        }
    }

    async storeUserProfile(profileData) {
        try {
            const { data, error } = await this.supabase
                .from('user_profile')
                .upsert([{
                    user_id: 1,
                    name: profileData.name,
                    phone: profileData.phone,
                    preferences: profileData.preferences,
                    social_profiles: profileData.socialProfiles,
                    updated_at: new Date().toISOString()
                }]);

            if (error) throw error;
            logger.info('👤 Updated user profile');
            return data;
        } catch (error) {
            logger.error('❌ Error storing user profile:', error);
            throw error;
        }
    }

    async getUserProfile() {
        try {
            const { data, error } = await this.supabase
                .from('user_profile')
                .select('*')
                .eq('user_id', 1)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (error) {
            logger.error('❌ Error getting user profile:', error);
            return null;
        }
    }

    async getStats() {
        try {
            const [conversations, goals] = await Promise.all([
                this.supabase.from('conversations').select('*', { count: 'exact', head: true }),
                this.supabase.from('goals').select('*', { count: 'exact', head: true })
            ]);

            return {
                totalMessages: conversations.count || 0,
                totalGoals: goals.count || 0,
                memoryHealth: this.isInitialized ? 'healthy' : 'disconnected'
            };
        } catch (error) {
            logger.error('❌ Error getting stats:', error);
            return { error: error.message };
        }
    }

    async getLastInteractionTime() {
        try {
            const { data, error } = await this.supabase
                .from('conversations')
                .select('timestamp')
                .eq('sender', 'user')
                .order('timestamp', { ascending: false })
                .limit(1);

            if (error) throw error;
            return data.length > 0 ? new Date(data[0].timestamp) : null;
        } catch (error) {
            logger.error('❌ Error getting last interaction time:', error);
            return null;
        }
    }
}

module.exports = MemoryManager;