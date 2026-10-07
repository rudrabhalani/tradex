const chartAnalyzer = require('../services/chartAnalyzer');

const analyzeChart = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Chart file is required.' });
        }

        const { message } = req.body;
        let conversationHistory = [];
        
        if (req.body.conversationHistory) {
            try {
                conversationHistory = JSON.parse(req.body.conversationHistory);
            } catch (e) {
                return res.status(400).json({ success: false, error: 'Invalid conversationHistory format. Must be JSON.' });
            }
        }

        const result = await chartAnalyzer.analyze(req.file.buffer, req.file.mimetype, message, conversationHistory);
        
        return res.status(200).json({ success: true, analysis: result });
    } catch (error) {
        next(error);
    }
};

const chatFollowUp = async (req, res, next) => {
    try {
        const { message, conversationHistory = [] } = req.body;
        
        if (!message) {
            return res.status(400).json({ success: false, error: 'Message is required.' });
        }

        const result = await chartAnalyzer.followUp(message, conversationHistory);
        
        return res.status(200).json({ success: true, analysis: result });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    analyzeChart,
    chatFollowUp
};
