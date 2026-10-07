const multer = require('multer');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.',
      });
    }
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`,
    });
  }

  if (err.message && err.message.includes('Unsupported file type')) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  if (err.message && err.message.includes('GEMINI_API_KEY')) {
    return res.status(500).json({
      success: false,
      error: 'AI service is not configured. Please set up the API key.',
    });
  }

  // Google AI API errors
  if (err.message && (err.message.includes('API key') || err.message.includes('quota') || err.message.includes('RESOURCE_EXHAUSTED'))) {
    return res.status(503).json({
      success: false,
      error: 'AI service temporarily unavailable. Please check your API key or try again later.',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'An unexpected error occurred. Please try again.',
  });
};

module.exports = errorHandler;
