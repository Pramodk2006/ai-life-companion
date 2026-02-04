// CLEAN SERVERLESS FUNCTION - NO IMPORTS
// Created: 2026-02-04 to fix AICompanion import error

console.log('Loading clean serverless function...');

module.exports = (req, res) => {
    console.log('🚀 Clean function invoked:', req.method, req.url);
    
    try {
        // Set headers
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        // Handle favicon
        if (req.url === '/favicon.ico') {
            console.log('✅ Favicon handled');
            res.status(204).end();
            return;
        }
        
        // Success response
        const response = {
            message: '🎉 Clean AI Companion Function Working!',
            status: 'success',
            method: req.method,
            url: req.url,
            timestamp: new Date().toISOString(),
            version: 'clean-v1'
        };
        
        console.log('✅ Sending response:', JSON.stringify(response));
        res.status(200).json(response);
        
    } catch (error) {
        console.error('❌ Function error:', error);
        res.status(500).json({
            error: 'Function failed',
            message: error.message
        });
    }
};

console.log('✅ Clean serverless function loaded successfully');