const { GoogleGenerativeAI } = require('@google/generative-ai');

const FALLBACK_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-flash-lite-latest'
];

class AIService {
  constructor() {
    this.genAI = null;
  }

  initialize() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables. Get a free key at https://aistudio.google.com/apikey');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  getGenAI() {
    if (!this.genAI) {
      this.initialize();
    }
    return this.genAI;
  }

  getCandidateModels() {
    const configured = process.env.GEMINI_MODEL;
    const candidates = configured ? [configured, ...FALLBACK_MODELS] : FALLBACK_MODELS;
    return [...new Set(candidates)];
  }

  async generateWithFallback(contents) {
    const genAI = this.getGenAI();
    const candidates = this.getCandidateModels();
    let lastError = null;

    for (const modelName of candidates) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent({ contents });
        const response = result.response;
        return response.text();
      } catch (err) {
        console.warn(`[TradeX AI] Model '${modelName}' failed: ${err.message}. Trying next fallback...`);
        lastError = err;
      }
    }

    throw lastError || new Error('All AI models failed to generate content.');
  }

  async analyzeImage(imageBuffer, mimeType, systemPrompt, userMessage, conversationHistory = []) {
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: mimeType,
      },
    };

    const contents = [];

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
      }
    }

    // Add current message with image
    const parts = [imagePart];
    const promptText = userMessage 
      ? `${systemPrompt}\n\nUser question / instruction: ${userMessage}`
      : `${systemPrompt}\n\nAnalyze and examine this image in full detail.`;
    parts.push({ text: promptText });

    contents.push({
      role: 'user',
      parts: parts,
    });

    return await this.generateWithFallback(contents);
  }

  async chat(systemPrompt, message, conversationHistory = []) {
    const contents = [];

    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
      }
    }

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\n${message}` }],
    });

    return await this.generateWithFallback(contents);
  }
}

module.exports = new AIService();
