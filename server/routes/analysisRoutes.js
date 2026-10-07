const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { analysisLimiter } = require('../middleware/rateLimiter');
const analysisController = require('../controllers/analysisController');

router.post('/analyze', analysisLimiter, upload.single('chart'), analysisController.analyzeChart);
router.post('/chat', analysisLimiter, express.json(), analysisController.chatFollowUp);

module.exports = router;
