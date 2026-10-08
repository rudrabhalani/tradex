const fs = require('fs');
const path = require('path');

// Storage path: /tmp for serverless Vercel, fallback to local data folder
const isVercel = !!process.env.VERCEL;
const STORAGE_PATH = isVercel
  ? '/tmp/tradex_analytics.json'
  : path.join(__dirname, '../data/analytics.json');

// Ensure data folder exists in local environment
if (!isVercel) {
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch (e) {
      console.warn('Could not create data dir:', e.message);
    }
  }
}

// In-memory state
let state = {
  metrics: {
    totalUsers: 1, // Default founder
    totalQueries: 0,
    totalCharts: 0,
    totalChats: 0,
  },
  users: [
    {
      id: 'usr_founder',
      name: 'BHALANI RUDRA SANDIPBHAI',
      email: 'founder@tradex.ai',
      role: 'Founder & Owner',
      userType: 'registered',
      device: 'Owner Workstation',
      joinedAt: new Date('2026-10-01T00:00:00Z').toISOString(),
      lastActive: new Date().toISOString(),
      queryCount: 15,
      chartCount: 10,
    }
  ],
  activities: [
    {
      id: 'act_init',
      userId: 'usr_founder',
      userName: 'BHALANI RUDRA SANDIPBHAI',
      action: 'SYSTEM_BOOT',
      details: 'TradeX AI Institutional Engine deployed & active',
      timestamp: new Date().toISOString(),
    }
  ]
};

// Load saved analytics from file if available
function loadState() {
  try {
    if (fs.existsSync(STORAGE_PATH)) {
      const raw = fs.readFileSync(STORAGE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.metrics && parsed.users) {
        state = parsed;
      }
    }
  } catch (err) {
    console.warn('Analytics load error (using in-memory):', err.message);
  }
}

// Save analytics to disk
function saveState() {
  try {
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Analytics save error:', err.message);
  }
}

// Initial load
loadState();

const OWNER_PIN = process.env.OWNER_PIN || 'rudra2026';

const analyticsService = {
  trackUser({ id, name, email, role = 'client', device = 'Web Browser' }) {
    if (!id) id = 'usr_' + Math.random().toString(36).substr(2, 9);
    
    const isGuest = role === 'Guest Trader' || role === 'guest' || (name && name.startsWith('Trader_')) || (id && id.startsWith('guest_'));
    const userType = isGuest ? 'guest' : 'registered';

    const existing = state.users.find(u => u.id === id || (email && u.email && u.email.toLowerCase() === email.toLowerCase() && !email.includes('@tradex.client')));

    const now = new Date().toISOString();
    if (existing) {
      existing.lastActive = now;
      if (device) existing.device = device;
      if (name && (!existing.name || existing.name.startsWith('Trader_'))) existing.name = name;
      if (email && (!existing.email || existing.email.includes('@tradex.client'))) existing.email = email;
      if (!isGuest && existing.userType === 'guest') {
        existing.userType = 'registered';
        existing.role = 'Registered Trader';
      }
      saveState();
      return existing;
    }

    const newUser = {
      id,
      name: name || (isGuest ? `Guest_${Math.floor(1000 + Math.random() * 9000)}` : 'Trader'),
      email: email || (isGuest ? 'guest@session.local' : ''),
      role: isGuest ? 'Guest Trader' : 'Registered Trader',
      userType,
      device: device || 'Web Browser',
      joinedAt: now,
      lastActive: now,
      queryCount: 0,
      chartCount: 0,
    };

    state.users.unshift(newUser);
    state.metrics.totalUsers = state.users.length;

    // Record activity
    this.recordActivity({
      userId: newUser.id,
      userName: newUser.name,
      action: isGuest ? 'GUEST_JOINED' : 'USER_REGISTERED',
      details: isGuest ? `Guest session started (${newUser.name})` : `New registered trader logged in (${newUser.name})`
    });

    saveState();
    return newUser;
  },

  recordActivity({ userId, userName, action, details }) {
    const activity = {
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      userId: userId || 'anonymous',
      userName: userName || 'Trader',
      action: action || 'AI_QUERY',
      details: details || '',
      timestamp: new Date().toISOString(),
    };

    state.activities.unshift(activity);
    if (state.activities.length > 200) {
      state.activities.pop();
    }

    // Update user counts if known
    if (userId) {
      const user = state.users.find(u => u.id === userId);
      if (user) {
        user.lastActive = activity.timestamp;
        user.queryCount = (user.queryCount || 0) + 1;
        if (action === 'CHART_ANALYSIS') {
          user.chartCount = (user.chartCount || 0) + 1;
        }
      }
    }

    // Update global metrics
    state.metrics.totalQueries++;
    if (action === 'CHART_ANALYSIS') {
      state.metrics.totalCharts++;
    } else if (action === 'CHAT_QUERY') {
      state.metrics.totalChats++;
    }

    saveState();
    return activity;
  },

  getStats() {
    // Count active in last 24h
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const activeRecent = state.users.filter(u => new Date(u.lastActive).getTime() > oneDayAgo).length;

    const registeredCount = state.users.filter(u => u.userType === 'registered' || u.role?.includes('Registered') || u.role?.includes('Founder')).length;
    const guestCount = state.users.filter(u => u.userType === 'guest' || u.role?.includes('Guest')).length;

    return {
      metrics: {
        totalUsers: state.users.length,
        registeredUsers: registeredCount,
        guestUsers: guestCount,
        activeLast24h: activeRecent || 1,
        totalQueries: state.metrics.totalQueries,
        totalCharts: state.metrics.totalCharts,
        totalChats: state.metrics.totalChats,
      },
      users: state.users,
      recentActivities: state.activities.slice(0, 60),
      owner: {
        name: 'BHALANI RUDRA SANDIPBHAI',
        title: 'Founder & Owner (17-year-old Entrepreneur)',
        systemStatus: 'Online & Protected'
      }
    };
  },

  verifyOwnerPin(pin) {
    if (!pin) return false;
    return String(pin).trim() === OWNER_PIN;
  }
};

module.exports = analyticsService;
