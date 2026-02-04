const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');

class ProfileScraper {
    constructor(memoryManager) {
        this.memory = memoryManager;
        this.rateLimitDelay = 5000; // 5 seconds between requests
        this.lastRequestTime = new Map();
    }

    async scrapeAllProfiles() {
        try {
            logger.info('🔍 Starting profile scraping...');
            
            const userProfile = await this.memory.getUserProfile();
            if (!userProfile || !userProfile.social_profiles) {
                logger.warn('⚠️  No social profiles configured');
                return { message: 'No social profiles configured. Please run setup.' };
            }
            
            const results = {};
            
            // GitHub scraping
            if (userProfile.social_profiles.github) {
                results.github = await this.scrapeGitHub(userProfile.social_profiles.github);
                await this.sleep(this.rateLimitDelay);
            }
            
            // LeetCode scraping
            if (userProfile.social_profiles.leetcode) {
                results.leetcode = await this.scrapeLeetCode(userProfile.social_profiles.leetcode);
                await this.sleep(this.rateLimitDelay);
            }
            
            // Store scraped data
            if (Object.keys(results).length > 0) {
                await this.storeScrapedData(results);
            }
            
            return results;
            
        } catch (error) {
            logger.error('❌ Error scraping profiles:', error);
            return { error: error.message };
        }
    }

    async scrapeGitHub(username) {
        try {
            if (!this.canMakeRequest('github')) {
                logger.debug('⏰ Rate limiting: skipping GitHub request');
                return null;
            }
            
            logger.info(`🐙 Scraping GitHub profile: ${username}`);
            
            const apiUrl = `https://api.github.com/users/${username}`;
            const response = await axios.get(apiUrl, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'AI-Companion-Personal-Use'
                }
            });
            
            if (response.status !== 200) {
                throw new Error(`GitHub API returned ${response.status}`);
            }
            
            const userData = response.data;
            
            // Get recent activity
            const eventsUrl = `https://api.github.com/users/${username}/events/public`;
            const eventsResponse = await axios.get(eventsUrl, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'AI-Companion-Personal-Use'
                }
            });
            
            const recentEvents = eventsResponse.data.slice(0, 10);
            
            const githubData = {
                username: userData.login,
                name: userData.name,
                publicRepos: userData.public_repos,
                followers: userData.followers,
                following: userData.following,
                bio: userData.bio,
                location: userData.location,
                company: userData.company,
                blog: userData.blog,
                createdAt: userData.created_at,
                updatedAt: userData.updated_at,
                recentActivity: recentEvents.map(event => ({
                    type: event.type,
                    repo: event.repo?.name,
                    createdAt: event.created_at,
                    public: event.public
                })),
                scrapedAt: new Date().toISOString()
            };
            
            this.updateLastRequestTime('github');
            logger.info(`✅ GitHub data scraped successfully for ${username}`);
            
            return githubData;
            
        } catch (error) {
            logger.error(`❌ Error scraping GitHub for ${username}:`, error.message);
            return { username, error: error.message, scrapedAt: new Date().toISOString() };
        }
    }

    async scrapeLeetCode(username) {
        try {
            if (!this.canMakeRequest('leetcode')) {
                logger.debug('⏰ Rate limiting: skipping LeetCode request');
                return null;
            }
            
            logger.info(`🧮 Scraping LeetCode profile: ${username}`);
            
            // Basic LeetCode profile structure - this may need updates as LeetCode changes
            const leetcodeData = {
                username: username,
                profileUrl: `https://leetcode.com/${username}/`,
                scrapedAt: new Date().toISOString(),
                note: 'LeetCode scraping requires careful handling to avoid being blocked',
                // Add actual scraping logic here when implementing
                problemsSolved: null,
                ranking: null,
                lastActive: null
            };
            
            this.updateLastRequestTime('leetcode');
            logger.info(`✅ LeetCode data structure created for ${username}`);
            
            return leetcodeData;
            
        } catch (error) {
            logger.error(`❌ Error scraping LeetCode for ${username}:`, error.message);
            return {
                username: username,
                profileUrl: `https://leetcode.com/${username}/`,
                scrapedAt: new Date().toISOString(),
                error: error.message
            };
        }
    }

    canMakeRequest(platform) {
        const now = Date.now();
        const lastTime = this.lastRequestTime.get(platform) || 0;
        return now - lastTime >= this.rateLimitDelay;
    }

    updateLastRequestTime(platform) {
        this.lastRequestTime.set(platform, Date.now());
    }

    async storeScrapedData(results) {
        try {
            for (const [platform, data] of Object.entries(results)) {
                if (data && !data.error) {
                    // Store in conversations as a special message type for now
                    await this.memory.storeMessage({
                        sender: 'scraper',
                        content: `Scraped ${platform} data for ${data.username}`,
                        timestamp: new Date(),
                        messageType: 'scrape_result',
                        platform: 'scraper',
                        scraped_data: data
                    });
                }
            }
            
            logger.info('💾 Scraped data stored successfully');
            
        } catch (error) {
            logger.error('❌ Error storing scraped data:', error);
        }
    }

    async getActivityUpdates() {
        try {
            // Get recent scraped data to find new activity
            const { data, error } = await this.memory.supabase
                .from('conversations')
                .select('*')
                .eq('sender', 'scraper')
                .order('timestamp', { ascending: false })
                .limit(5);
            
            if (error) throw error;
            
            const updates = [];
            
            for (const record of data) {
                if (record.scraped_data && record.scraped_data.recentActivity) {
                    const recentCommits = record.scraped_data.recentActivity
                        .filter(activity => activity.type === 'PushEvent')
                        .slice(0, 3);
                    
                    if (recentCommits.length > 0) {
                        updates.push({
                            platform: 'github',
                            type: 'commits',
                            count: recentCommits.length,
                            message: `Recent GitHub activity: ${recentCommits.length} new commits`
                        });
                    }
                }
            }
            
            return updates;
            
        } catch (error) {
            logger.error('❌ Error getting activity updates:', error);
            return [];
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getStatus() {
        return {
            rateLimitDelay: this.rateLimitDelay,
            lastRequests: Object.fromEntries(this.lastRequestTime),
            supportedPlatforms: ['github', 'leetcode']
        };
    }
}

module.exports = ProfileScraper;