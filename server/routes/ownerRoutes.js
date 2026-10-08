const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');

// Middleware to protect owner endpoints
const verifyOwnerAuth = (req, res, next) => {
  const token = req.headers['x-owner-token'] || req.headers['authorization'];
  if (token && (token.includes('tradex_owner_') || token.includes('rudra2026'))) {
    return next();
  }
  return res.status(401).json({ success: false, error: 'Unauthorized: Owner credentials required.' });
};

// Owner Login with PIN / Password
router.post('/login', (req, res) => {
  const { pin } = req.body;
  if (!pin) {
    return res.status(400).json({ success: false, error: 'PIN / Password is required.' });
  }

  const isValid = analyticsService.verifyOwnerPin(pin);
  if (!isValid) {
    return res.status(401).json({ success: false, error: 'Incorrect Owner PIN. Access Denied.' });
  }

  const ownerToken = 'tradex_owner_' + Buffer.from(`rudra:${Date.now()}`).toString('base64');
  return res.status(200).json({
    success: true,
    token: ownerToken,
    owner: {
      name: 'BHALANI RUDRA SANDIPBHAI',
      role: 'Founder & Owner',
      verified: true
    }
  });
});

// Get Live Analytics & Users (Owner Only)
router.get('/stats', verifyOwnerAuth, (req, res) => {
  try {
    const data = analyticsService.getStats();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Client User Tracking Endpoint (Public)
router.post('/track-user', (req, res) => {
  try {
    const { id, name, email, role } = req.body;
    const user = analyticsService.trackUser({ id, name, email, role });
    return res.status(200).json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
