# TradeX — AI Trading Chart Analyzer

TradeX is a clean, minimal AI-powered trading chart analysis web application. Upload a screenshot of any trading chart, and TradeX will analyze it with professional-grade technical analysis.

![TradeX](https://img.shields.io/badge/TradeX-v1.0-black) ![License](https://img.shields.io/badge/license-MIT-gray)

## Features

- **Upload & Analyze** — Upload chart screenshots from TradingView, Binance, MetaTrader, or any broker
- **Multi-Market Support** — Indian Stocks (₹), US Stocks ($), Forex, Crypto, Commodities, Indices, Futures
- **Smart Currency Detection** — Automatically uses correct currency/notation for each market
- **Complete Analysis** — Trend, market structure, support/resistance, indicators, entry/SL/TP
- **LONG / SHORT / WAIT** — Never forces a trade when setup is unclear
- **Chat Interface** — Follow-up questions with conversation context
- **Clean UI** — Minimal black & white ChatGPT-style interface

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| AI | Google Gemini (Vision) |
| Image Processing | Sharp |

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [Google Gemini API Key](https://aistudio.google.com/apikey) (free)

### 1. Clone the repository

```bash
git clone https://github.com/rudrabhalani/tradex.git
cd tradex
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install server and client dependencies
npm run install:all
```

### 3. Set up environment variables

```bash
# Copy the example env file
cp .env.example .env

# On Windows:
copy .env.example .env
```

Edit `.env` and add your Gemini API key:

```
GEMINI_API_KEY=your_actual_api_key_here
```

### 4. Start the application

**Development mode (with hot reload):**

```bash
npm run dev
```

This starts both the backend (port 3001) and frontend (port 5173).

**Or start separately:**

```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:client
```

### 5. Open the app

Visit [http://localhost:5173](http://localhost:5173)

## How It Works

1. **Upload** a trading chart screenshot (PNG, JPG, WEBP)
2. The image is sent to the **backend** (never exposed to the browser)
3. The backend sends the image to **Google Gemini Vision** with a specialized trading analysis prompt
4. Gemini analyzes the chart and returns structured technical analysis
5. The analysis is displayed in a **clean chat interface**

## Project Structure

```
tradex/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   │   ├── ChatArea.jsx
│   │   │   ├── ChatMessage.jsx
│   │   │   ├── InputArea.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── services/
│   │   │   └── api.js       # API client
│   │   ├── App.jsx          # Main app
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Styles
│   ├── package.json
│   └── vite.config.js
│
├── server/                  # Express backend
│   ├── controllers/
│   │   └── analysisController.js
│   ├── routes/
│   │   └── analysisRoutes.js
│   ├── services/
│   │   ├── aiService.js     # Gemini AI integration
│   │   ├── chartAnalyzer.js # Analysis orchestrator
│   │   └── marketService.js # Future market data
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── upload.js
│   ├── server.js
│   └── package.json
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## API Key Setup

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click "Create API Key"
3. Copy the key
4. Paste it in your `.env` file as `GEMINI_API_KEY`

The free tier is generous for personal use.

## Supported Markets

| Market | Currency | Examples |
|--------|----------|----------|
| Indian Stocks | ₹ (INR) | NIFTY, BANKNIFTY, RELIANCE, TCS |
| US Stocks | $ (USD) | AAPL, TSLA, GOOGL, AMZN |
| Forex | Pair notation | EURUSD, GBPUSD, USDJPY |
| Crypto | Quote currency | BTCUSDT, ETHUSDT, SOLUSDT |
| Commodities | Market default | XAUUSD, XAGUSD, Crude Oil |
| Indices | Market default | S&P 500, NASDAQ, DAX |
| Futures | Contract notation | ES, NQ, CL |

## Deployment

### Build for production

```bash
npm run build
```

The frontend builds to `client/dist/`. The backend serves the API.

### Deploy to Render

1. Push to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Connect your GitHub repo
4. Set:
   - **Build Command:** `cd client && npm install && npm run build && cd ../server && npm install`
   - **Start Command:** `cd server && node server.js`
   - **Environment Variable:** `GEMINI_API_KEY=your_key`

### Deploy to Railway

1. Push to GitHub
2. Create a new project on [Railway](https://railway.app)
3. Connect your GitHub repo
4. Add environment variable `GEMINI_API_KEY`
5. Railway auto-detects Node.js

### Deploy to Vercel (Frontend) + Render (Backend)

1. Deploy `client/` to Vercel
2. Deploy `server/` to Render
3. Update `CORS_ORIGIN` in backend env
4. Update API base URL in frontend

## Security

- API keys never exposed to frontend
- File type validation (PNG, JPG, WEBP only)
- File size limit (10MB)
- Rate limiting (10 requests/minute)
- Helmet security headers
- No permanent image storage

## Future Roadmap

The codebase is structured to support future additions:

- [ ] Live market data (Yahoo Finance, Binance, Alpha Vantage)
- [ ] TradingView integration
- [ ] Telegram/WhatsApp alerts
- [ ] User accounts & saved analyses
- [ ] Trade journal
- [ ] Backtesting
- [ ] Voice interaction
- [ ] Mobile app

## Disclaimer

AI-generated market analysis is for **educational and informational purposes only**. It is not financial advice and does not guarantee profits. Always do your own research before making trading decisions.

## License

MIT
