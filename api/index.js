// Ultra-minimal serverless function for debugging
module.exports = async (req, res) => {
    try {
        console.log('Request received:', req.method, req.url);
        
        // Set basic headers
        res.setHeader('Content-Type', 'application/json');
        
        if (req.method === 'GET' && req.url === '/favicon.ico') {
            res.status(204).end();
            return;
        }
        
        // Basic response for all other requests
        res.status(200).json({
            message: '🤖 AI Companion - Minimal Mode',
            status: 'working',
            method: req.method,
            url: req.url,
            timestamp: new Date().toISOString(),
            environment: {
                node_env: process.env.NODE_ENV,
                vercel: !!process.env.VERCEL,
                has_supabase_url: !!process.env.SUPABASE_URL,
                has_supabase_key: !!process.env.SUPABASE_ANON_KEY
            }
        });
        
    } catch (error) {
        console.error('Error in serverless function:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
};