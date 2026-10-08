import React, { useState } from 'react';

export default function LoginModal({ isOpen, onClose, onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name or trader handle.');
      return;
    }

    const user = {
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      name: name.trim(),
      email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '')}@tradex.client`,
      role: 'Registered Trader',
      joinedAt: new Date().toISOString(),
    };

    onLogin(user);
  };

  const handleGuestLogin = () => {
    const guestNumber = Math.floor(1000 + Math.random() * 9000);
    const guestUser = {
      id: 'guest_' + Date.now().toString(36),
      name: `Trader_${guestNumber}`,
      email: `guest_${guestNumber}@tradex.client`,
      role: 'Guest Trader',
      joinedAt: new Date().toISOString(),
    };

    onLogin(guestUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-[#121215] border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-gray-900 dark:text-zinc-100">
        
        {/* Close / Skip button */}
        <button
          onClick={handleGuestLogin}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 dark:hover:text-white text-lg font-bold p-1 rounded-lg"
          title="Continue as Guest"
        >
          ✕
        </button>

        {/* Branding & Logo */}
        <div className="text-center mb-6">
          <div className="relative inline-block mb-3">
            <img
              src="/logo.svg"
              alt="TradeX AI"
              className="w-16 h-16 mx-auto rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800"
            />
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            Welcome to TradeX AI
          </h2>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider mt-1">
            Institutional Chart Vision • Universal Intelligence
          </p>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2">
            Sign in to track your chart analyses, save history, and receive institutional buy/sell setups.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mb-1.5">
              Trader Name / Handle <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="e.g. Alex Mercer, TraderX"
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-[#18181c] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mb-1.5">
              Email Address <span className="text-gray-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alex@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-[#18181c] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-sm hover:opacity-90 active:scale-[0.99] transition-all shadow-md mt-2 flex items-center justify-center gap-2"
          >
            <span>Sign In & Enter TradeX</span>
            <span>→</span>
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800/80 text-center">
          <button
            type="button"
            onClick={handleGuestLogin}
            className="text-xs text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors font-medium underline underline-offset-4"
          >
            ⚡ Continue as Guest Trader without signing in
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[10px] text-gray-400 dark:text-zinc-500">
            Founded & Owned by 17-year-old entrepreneur <strong>BHALANI RUDRA SANDIPBHAI</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
