const chartAnalyzer = require('../services/chartAnalyzer');
const analyticsService = require('../services/analyticsService');

const analyzeChart = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Chart file is required.' });
        }

        const { message, userId, userName } = req.body;
        let conversationHistory = [];
        
        if (req.body.conversationHistory) {
            try {
                conversationHistory = JSON.parse(req.body.conversationHistory);
            } catch (e) {
                return res.status(400).json({ success: false, error: 'Invalid conversationHistory format. Must be JSON.' });
            }
        }

        const result = await chartAnalyzer.analyze(req.file.buffer, req.file.mimetype, message, conversationHistory);
        
        // Track analytics for owner
        analyticsService.recordActivity({
            userId,
            userName,
            action: 'CHART_ANALYSIS',
            details: message ? `Analyzed chart: "${message.substring(0, 40)}..."` : 'Analyzed chart screenshot'
        });

        return res.status(200).json({ success: true, analysis: result });
    } catch (error) {
        next(error);
    }
};

const chatFollowUp = async (req, res, next) => {
    try {
        const { message, conversationHistory = [], userId, userName } = req.body;
        
        if (!message) {
            return res.status(400).json({ success: false, error: 'Message is required.' });
        }

        const result = await chartAnalyzer.followUp(message, conversationHistory);
        
        // Track analytics for owner
        analyticsService.recordActivity({
            userId,
            userName,
            action: 'CHAT_QUERY',
            details: `Question: "${message.substring(0, 50)}"`
        });

        return res.status(200).json({ success: true, analysis: result });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    analyzeChart,
    chatFollowUp
};
