/**
 * Market Data Service
 * 
 * This service provides a clean abstraction layer for future market data integrations.
 * Currently serves as an architecture placeholder.
 * 
 * Supported providers can be added:
 * - Yahoo Finance
 * - Alpha Vantage
 * - Twelve Data
 * - Binance API
 * - NSE India
 * - Polygon.io
 * - OANDA
 * 
 * Usage:
 *   const marketService = require('./marketService');
 *   const data = await marketService.getQuote('AAPL', 'yahoo');
 */

class MarketService {
  constructor() {
    this.providers = new Map();
  }

  registerProvider(name, provider) {
    this.providers.set(name, provider);
  }

  async getQuote(symbol, providerName) {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Market data provider '${providerName}' is not registered. Available: ${Array.from(this.providers.keys()).join(', ')}`);
    }
    return provider.getQuote(symbol);
  }

  async getCandles(symbol, timeframe, providerName) {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Market data provider '${providerName}' is not registered.`);
    }
    if (typeof provider.getCandles !== 'function') {
      throw new Error(`Provider '${providerName}' does not support candle data.`);
    }
    return provider.getCandles(symbol, timeframe);
  }

  getAvailableProviders() {
    return Array.from(this.providers.keys());
  }
}

module.exports = new MarketService();
