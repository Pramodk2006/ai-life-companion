// Bulletproof minimal serverless function
module.exports = (req, res) => {
    // Immediate try-catch around everything
    try {
        console.log('Function started:', req.method, req.url);
        
        // Set essential headers first
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache');
        
        // Handle favicon immediately
        if (req.url === '/favicon.ico') {
            console.log('Favicon request handled');
            res.status(204).end();
            return;
        }
        
        // Simple success response for everything else
        const response = {
            success: true,
            message: '🤖 AI Companion - Working!',
            method: req.method,
            url: req.url,
            timestamp: new Date().toISOString(),
            nodeVersion: process.version,
            platform: process.platform
        };
        
        console.log('Sending response:', response);
        res.status(200).json(response);
        
    } catch (error) {
        // Emergency error handler
        console.error('Function error:', error);
        try {
            res.status(500).json({
                error: 'Function failed',
                message: error.message,
                stack: error.stack
            });
        } catch (responseError) {
            // Last resort - plain text response
            console.error('Response error:', responseError);
            res.status(500).end('Function completely failed');
        }
    }
};