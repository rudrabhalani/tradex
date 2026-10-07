const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.genAI = null;
    this.model = null;
  }

  initialize() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables. Get a free key at https://aistudio.google.com/apikey');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    });
  }

  getModel() {
    if (!this.model) {
      this.initialize();
    }
    return this.model;
  }

  async analyzeImage(imageBuffer, mimeType, systemPrompt, userMessage, conversationHistory = []) {
    const model = this.getModel();
    
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
      ? `${systemPrompt}\n\nUser's additional context: ${userMessage}\n\nAnalyze this trading chart.`
      : `${systemPrompt}\n\nAnalyze this trading chart.`;
    parts.push({ text: promptText });
    
    contents.push({
      role: 'user',
      parts: parts,
    });

    const result = await model.generateContent({ contents });
    const response = result.response;
    return response.text();
  }

  async chat(systemPrompt, message, conversationHistory = []) {
    const model = this.getModel();
    
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

    const result = await model.generateContent({ contents });
    const response = result.response;
    return response.text();
  }
}

module.exports = new AIService();
