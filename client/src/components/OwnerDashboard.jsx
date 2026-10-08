import React, { useState, useEffect } from 'react';
import { ownerLogin, getOwnerStats } from '../services/api';

export default function OwnerDashboard({ onBackToClient }) {
  const [pin, setPin] = useState('');
  const [token, setToken] = useState(() => localStorage.getItem('tradex_owner_token') || '');
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'activity'
  const [userFilter, setUserFilter] = useState('all'); // 'all' | 'registered' | 'guest'

  // Fetch stats if authenticated
  const fetchStats = async (ownerToken) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getOwnerStats(ownerToken);
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load owner data');
      if (err.message.includes('Unauthorized')) {
        setToken('');
        localStorage.removeItem('tradex_owner_token');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats(token);
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!pin) {
      setError('Please enter your Owner Master PIN.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await ownerLogin(pin);
      if (res.token) {
        setToken(res.token);
        localStorage.setItem('tradex_owner_token', res.token);
        await fetchStats(res.token);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Incorrect PIN.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setStats(null);
    localStorage.removeItem('tradex_owner_token');
  };

  const handleExportCSV = () => {
    if (!stats || !stats.users) return;
    const headers = ['User ID', 'Name', 'Email', 'Type', 'Device', 'Charts Analyzed', 'Total Queries', 'Joined At', 'Last Active'];
    const rows = stats.users.map(u => [
      u.id,
      `"${u.name}"`,
      `"${u.email}"`,
      u.userType === 'registered' ? 'Registered User' : 'Guest User',
      `"${u.device || 'Web'}"`,
      u.chartCount || 0,
      u.queryCount || 0,
      `"${new Date(u.joinedAt).toLocaleString()}"`,
      `"${new Date(u.lastActive).toLocaleString()}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tradex_users_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter users based on tab filter & search
  const filteredUsers = stats?.users?.filter(u => {
    // Type filter
    if (userFilter === 'registered') {
      const isReg = u.userType === 'registered' || u.role?.includes('Registered') || u.role?.includes('Founder');
      if (!isReg) return false;
    }
    if (userFilter === 'guest') {
      const isGuest = u.userType === 'guest' || u.role?.includes('Guest');
      if (!isGuest) return false;
    }

    // Search query
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.id && u.id.toLowerCase().includes(q)) ||
      (u.device && u.device.toLowerCase().includes(q))
    );
  }) || [];

  const registeredTotal = stats?.metrics?.registeredUsers ?? stats?.users?.filter(u => u.userType === 'registered' || u.role?.includes('Registered') || u.role?.includes('Founder')).length ?? 0;
  const guestTotal = stats?.metrics?.guestUsers ?? stats?.users?.filter(u => u.userType === 'guest' || u.role?.includes('Guest')).length ?? 0;

  // If not authenticated, show PIN login screen
  if (!token) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#10131b] border border-zinc-800 rounded-3xl p-8 shadow-2xl relative">
          <div className="text-center mb-6">
            <div className="relative inline-block mb-3">
              <img
                src="/logo.svg"
                alt="TradeX AI"
                className="w-16 h-16 mx-auto rounded-2xl shadow-xl border border-zinc-700"
              />
            </div>
            <div className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-[11px] font-bold text-amber-400 mb-2">
              👑 FOUNDER & OWNER COMMAND CENTER
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              Owner Security Portal
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Private access for <strong>BHALANI RUDRA SANDIPBHAI</strong>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-red-950/50 border border-red-800 rounded-xl text-xs text-red-300">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Owner Security PIN / Password
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN (Default: rudra2026)"
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-zinc-700 bg-[#161a24] text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-zinc-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-white text-black font-extrabold text-sm hover:bg-zinc-200 active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Unlock Owner Dashboard →'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
            <button
              onClick={onBackToClient}
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              ← Back to Client AI
            </button>
            <span>v3.0 Secure</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col font-sans">
      {/* Top Owner Navigation Bar */}
      <header className="border-b border-zinc-800 bg-[#0d1017]/90 backdrop-blur-md px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="TradeX" className="w-8 h-8 rounded-lg shadow-sm border border-zinc-700" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-base tracking-tight">TradeX AI</span>
              <span className="text-[10px] uppercase font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Owner Portal
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Founder & Owner: <strong>BHALANI RUDRA SANDIPBHAI</strong> (17-year-old Entrepreneur)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchStats(token)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-xs text-zinc-300 transition-colors flex items-center gap-1.5"
            title="Refresh Live Analytics"
          >
            <span className={isLoading ? 'animate-spin' : ''}>🔄</span>
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-xs text-zinc-300 transition-colors flex items-center gap-1.5"
            title="Download CSV of users"
          >
            <span>📥</span>
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={onBackToClient}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors"
          >
            Open Client AI ↗
          </button>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg border border-zinc-700 hover:bg-red-950/40 hover:border-red-800 text-zinc-400 hover:text-red-300 transition-colors"
            title="Lock & Sign Out"
          >
            🔒
          </button>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* KPI Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
          {/* Card 1: Total Users */}
          <div className="p-4 rounded-2xl bg-[#0f131c] border border-zinc-800 shadow-lg">
            <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Total Traffic</span>
              <span>👥</span>
            </div>
            <div className="text-2xl font-black text-white">
              {stats?.metrics?.totalUsers ?? '...'}
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5">All users & guests</p>
          </div>

          {/* Card 2: Registered Users */}
          <div className="p-4 rounded-2xl bg-[#0f131c] border border-emerald-900/40 shadow-lg">
            <div className="text-emerald-400 text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Registered</span>
              <span>🔐</span>
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {registeredTotal}
            </div>
            <p className="text-[10px] text-emerald-400/80 mt-0.5">Logged-in traders</p>
          </div>

          {/* Card 3: Guest Users */}
          <div className="p-4 rounded-2xl bg-[#0f131c] border border-zinc-800 shadow-lg">
            <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Guests</span>
              <span>👤</span>
            </div>
            <div className="text-2xl font-black text-zinc-300">
              {guestTotal}
            </div>
            <p className="text-[10px] text-zinc-500 mt-0.5">Guest sessions</p>
          </div>

          {/* Card 4: Active Today */}
          <div className="p-4 rounded-2xl bg-[#0f131c] border border-zinc-800 shadow-lg">
            <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Active (24h)</span>
              <span>🟢</span>
            </div>
            <div className="text-2xl font-black text-emerald-300">
              {stats?.metrics?.activeLast24h ?? '...'}
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5">Active today</p>
          </div>

          {/* Card 5: Charts Analyzed */}
          <div className="p-4 rounded-2xl bg-[#0f131c] border border-zinc-800 shadow-lg">
            <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Charts</span>
              <span>📈</span>
            </div>
            <div className="text-2xl font-black text-cyan-400">
              {stats?.metrics?.totalCharts ?? 0}
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5">Screenshots</p>
          </div>

          {/* Card 6: Total Queries */}
          <div className="p-4 rounded-2xl bg-[#0f131c] border border-zinc-800 shadow-lg">
            <div className="text-zinc-400 text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>AI Queries</span>
              <span>⚡</span>
            </div>
            <div className="text-2xl font-black text-purple-400">
              {stats?.metrics?.totalQueries ?? 0}
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5">Total prompts</p>
          </div>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          {/* Main Tabs (Users vs Activity Stream) */}
          <div className="flex bg-[#0f131c] border border-zinc-800 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'users'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              👥 User Management ({stats?.users?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'activity'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              ⚡ Live Activity Stream ({stats?.recentActivities?.length || 0})
            </button>
          </div>

          {/* User Type Filters (All vs Registered vs Guests) */}
          {activeTab === 'users' && (
            <div className="flex items-center gap-2">
              <div className="flex bg-[#0f131c] border border-zinc-800 rounded-xl p-1 text-xs font-medium">
                <button
                  onClick={() => setUserFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    userFilter === 'all'
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  All ({stats?.users?.length || 0})
                </button>
                <button
                  onClick={() => setUserFilter('registered')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    userFilter === 'registered'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  🔐 Registered ({registeredTotal})
                </button>
                <button
                  onClick={() => setUserFilter('guest')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    userFilter === 'guest'
                      ? 'bg-zinc-800 text-zinc-300'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  👤 Guests ({guestTotal})
                </button>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, email, device..."
                  className="w-full px-3 py-1.5 pl-8 rounded-xl border border-zinc-800 bg-[#0f131c] text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white"
                />
                <span className="absolute left-2.5 top-2 text-zinc-500 text-xs">🔍</span>
              </div>
            </div>
          )}
        </div>

        {/* Tab 1: User Directory Table */}
        {activeTab === 'users' && (
          <div className="bg-[#0f131c] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
              <h2 className="font-bold text-sm text-white">
                Detailed User & Trader Log
              </h2>
              <span className="text-xs text-zinc-400">
                Displaying {filteredUsers.length} of {stats?.users?.length || 0} total sessions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141824] text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3.5">Trader</th>
                    <th className="px-4 py-3.5">Contact / Email</th>
                    <th className="px-4 py-3.5">Account Type</th>
                    <th className="px-4 py-3.5">Device / Platform</th>
                    <th className="px-4 py-3.5 text-center">Charts Analyzed</th>
                    <th className="px-4 py-3.5 text-center">Total Queries</th>
                    <th className="px-4 py-3.5">First Joined</th>
                    <th className="px-4 py-3.5">Last Active</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-zinc-500">
                        No users found for selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isRegistered = user.userType === 'registered' || user.role?.includes('Registered') || user.role?.includes('Founder');
                      const isFounder = user.role?.includes('Founder');

                      return (
                        <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="px-4 py-3.5 font-bold text-white flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] border ${
                              isFounder
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : isRegistered
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                            }`}>
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {isFounder && <span className="text-[10px] text-amber-400 font-extrabold">👑 OWNER</span>}
                              </div>
                              <div className="text-[10px] text-zinc-500 font-mono">{user.id}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-zinc-300 font-mono text-[11px]">
                            {user.email || '—'}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isFounder
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : isRegistered
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700'
                            }`}>
                              {isRegistered ? '🔐 Logged In' : '👤 Guest User'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-zinc-400 text-[11px]">
                            {user.device || 'Web Browser'}
                          </td>
                          <td className="px-4 py-3.5 text-center font-bold text-cyan-400">
                            {user.chartCount || 0}
                          </td>
                          <td className="px-4 py-3.5 text-center font-bold text-purple-400">
                            {user.queryCount || 0}
                          </td>
                          <td className="px-4 py-3.5 text-zinc-400 text-[11px]">
                            {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-4 py-3.5 text-zinc-300 text-[11px]">
                            {user.lastActive ? new Date(user.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                              Active
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Real-time Activity Stream */}
        {activeTab === 'activity' && (
          <div className="bg-[#0f131c] border border-zinc-800 rounded-2xl p-5 shadow-xl">
            <h2 className="font-bold text-sm text-white mb-4 flex items-center justify-between">
              <span>Real-Time Action Stream</span>
              <span className="text-xs text-zinc-400">Live feed of user interactions</span>
            </h2>

            <div className="space-y-2.5">
              {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-[#141824] border border-zinc-800/80 flex items-center justify-between text-xs hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">
                        {act.action === 'CHART_ANALYSIS' ? '📈' : act.action === 'GUEST_JOINED' ? '👤' : act.action === 'USER_REGISTERED' ? '🔐' : '⚡'}
                      </span>
                      <div>
                        <div className="font-bold text-white">
                          <span className="text-emerald-400">{act.userName}</span>: {act.details}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          ID: {act.userId} • Action: {act.action}
                        </div>
                      </div>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono shrink-0 ml-4">
                      {new Date(act.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  No activity events logged yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Founder & Regulatory Footer */}
        <div className="p-4 rounded-xl bg-[#0f131c] border border-zinc-800/80 text-center text-xs text-zinc-500">
          TradeX AI Software Architecture • Owned & Controlled by <strong>BHALANI RUDRA SANDIPBHAI</strong>
        </div>
      </main>
    </div>
  );
}
