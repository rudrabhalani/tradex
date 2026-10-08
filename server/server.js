const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');

// Load dotenv config
dotenv.config({ path: path.join(__dirname, '../.env') });

const analysisRoutes = require('./routes/analysisRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

app.use('/api/analysis', analysisRoutes);
app.use('/api/owner', ownerRoutes);

// Global Error Handler
app.use(errorHandler);

// Listen only when run directly and not in serverless environment (e.g. Vercel)
if (!process.env.VERCEL && require.main === module) {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
