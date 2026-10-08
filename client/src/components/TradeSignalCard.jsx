import React, { useState } from 'react';
import voiceService from '../services/voiceService';

/**
 * Parses raw text from TradeX AI to see if it represents an actionable trading signal.
 * Returns an object with parsed fields or null if it's general conversational/chat text.
 */
export function parseTradeSignal(content) {
  if (!content || typeof content !== 'string') return null;

  // Check for presence of signal keywords
  const hasAction = /(?:ACTION|SIGNAL|BIAS|POSITION)\s*:\s*(BUY|SELL|WAIT|LONG|SHORT)/i.test(content) ||
                    /#+\s*.*(BUY|SELL|WAIT|LONG|SHORT)/i.test(content) ||
                    /\b(BUY\s*\(LONG\)|SELL\s*\(SHORT\)|WAIT\s*\(NO\s*TRADE\))\b/i.test(content);

  const hasTradeLevels = /(?:ENTRY|STOP\s*LOSS|TAKE\s*PROFIT|RISK\s*\/\s*REWARD)/i.test(content);

  if (!hasAction && !hasTradeLevels) {
    return null;
  }

  // 1. Determine Action: BUY / SELL / WAIT
  let action = 'WAIT (NO TRADE)';
  let isBuy = false;
  let isSell = false;
  let isWait = true;

  if (/(?:BUY|LONG)/i.test(content) && !/(?:SELL|SHORT)/i.test(content.match(/ACTION.*|SIGNAL.*|BIAS.*|POSITION.*/i)?.[0] || '')) {
    action = 'LONG (BUY) POSITION';
    isBuy = true;
    isWait = false;
  } else if (/(?:SELL|SHORT)/i.test(content)) {
    action = 'SHORT (SELL) POSITION';
    isSell = true;
    isWait = false;
  } else if (/WAIT/i.test(content)) {
    action = 'WAIT (NO TRADE)';
    isWait = true;
  }

  // Double check explicit ACTION line
  const actionLineMatch = content.match(/(?:ACTION|SIGNAL|BIAS|POSITION)\s*:\s*([^\n\r]+)/i);
  if (actionLineMatch) {
    const rawAct = actionLineMatch[1].toUpperCase();
    if (rawAct.includes('BUY') || rawAct.includes('LONG')) {
      action = 'LONG (BUY) POSITION';
      isBuy = true;
      isSell = false;
      isWait = false;
    } else if (rawAct.includes('SELL') || rawAct.includes('SHORT')) {
      action = 'SHORT (SELL) POSITION';
      isSell = true;
      isBuy = false;
      isWait = false;
    } else if (rawAct.includes('WAIT')) {
      action = 'WAIT (NO TRADE)';
      isWait = true;
      isBuy = false;
      isSell = false;
    }
  }

  // 2. Confidence
  const confMatch = content.match(/CONFIDENCE\s*:\s*([0-9]{1,3}%?)/i);
  const confidence = confMatch ? confMatch[1] : null;

  // 3. Market & Timeframe
  const marketMatch = content.match(/MARKET\s*:\s*([^\n\r*]+)/i);
  const market = marketMatch ? marketMatch[1].trim() : null;

  const tfMatch = content.match(/TIMEFRAME\s*:\s*([^\n\r*]+)/i);
  const timeframe = tfMatch ? tfMatch[1].trim() : null;

  // 4. Entry Zone
  const entryMatch = content.match(/ENTRY(?:\s*ZONE|\s*ORDER)?\s*:\s*([^\n\r*]+)/i);
  const entry = entryMatch ? entryMatch[1].trim() : null;

  // 5. Stop Loss
  const slMatch = content.match(/STOP\s*LOSS(?:\s*ORDER|\s*PRICE)?\s*:\s*([^\n\r*]+)/i);
  const stopLoss = slMatch ? slMatch[1].trim() : null;

  // 6. Take Profit targets
  const tp1Match = content.match(/TAKE\s*PROFIT\s*1\s*:\s*([^\n\r*]+)/i);
  const tp2Match = content.match(/TAKE\s*PROFIT\s*2\s*:\s*([^\n\r*]+)/i);
  const tp3Match = content.match(/TAKE\s*PROFIT\s*3\s*:\s*([^\n\r*]+)/i);

  const takeProfits = [];
  if (tp1Match) takeProfits.push({ label: 'Take Profit 1', value: tp1Match[1].trim(), targetNote: 'Partial Profit (30-50%) • Move SL to Breakeven' });
  if (tp2Match) takeProfits.push({ label: 'Take Profit 2', value: tp2Match[1].trim(), targetNote: 'Main Target • Secure majority gains' });
  if (tp3Match) takeProfits.push({ label: 'Take Profit 3', value: tp3Match[1].trim(), targetNote: 'Extended Target • Runner position' });

  // 7. Risk / Reward
  const rrMatch = content.match(/RISK\s*\/?\s*REWARD\s*:\s*([^\n\r*]+)/i);
  const riskReward = rrMatch ? rrMatch[1].trim() : null;

  // 8. Quick Setup Bullets
  const bullets = [];
  const lines = content.split('\n');
  let inBullets = false;
  for (const line of lines) {
    if (/QUICK\s*SETUP|ANALYSIS|REASON|PLAN/i.test(line)) {
      inBullets = true;
      continue;
    }
    if (inBullets && /INVALIDATION|IMPORTANT|WATCH\s*TRIGGER|DISCLAIMER/i.test(line)) {
      inBullets = false;
    }
    if (inBullets && (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*'))) {
      const cleaned = line.replace(/^[•\-*]\s*/, '').trim();
      if (cleaned) bullets.push(cleaned);
    }
  }

  // 9. Invalidation
  const invalMatch = content.match(/INVALIDATION\s*:\s*([^\n\r]+)/i);
  const invalidation = invalMatch ? invalMatch[1].trim() : null;

  // 10. Wait Triggers
  const watchBuyMatch = content.match(/WATCH\s*TRIGGER\s*BUY\s*:\s*([^\n\r]+)/i);
  const watchSellMatch = content.match(/WATCH\s*TRIGGER\s*SELL\s*:\s*([^\n\r]+)/i);
  const watchBuy = watchBuyMatch ? watchBuyMatch[1].trim() : null;
  const watchSell = watchSellMatch ? watchSellMatch[1].trim() : null;

  return {
    isBuy,
    isSell,
    isWait,
    action,
    confidence,
    market,
    timeframe,
    entry,
    stopLoss,
    takeProfits,
    riskReward,
    bullets: bullets.slice(0, 4),
    invalidation,
    watchBuy,
    watchSell
  };
}

export default function TradeSignalCard({ data }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showLegalNotice, setShowLegalNotice] = useState(false);

  if (!data) return null;

  const {
    isBuy,
    isSell,
    isWait,
    action,
    confidence,
    market,
    timeframe,
    entry,
    stopLoss,
    takeProfits,
    riskReward,
    bullets,
    invalidation,
    watchBuy,
    watchSell
  } = data;

  const handleVoicePlay = () => {
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    let speechScript = `TradeX Alert. ${action}. `;
    if (market) speechScript += `for ${market}. `;
    if (confidence) speechScript += `Confidence is ${confidence}. `;
    if (entry) speechScript += `Entry zone at ${entry}. `;
    if (stopLoss) speechScript += `Set protective stop loss at ${stopLoss}. `;
    if (takeProfits.length > 0) {
      speechScript += `First take profit target is ${takeProfits[0].value}. `;
    }
    if (riskReward) speechScript += `Risk to reward ratio is ${riskReward}. `;

    voiceService.speak(
      speechScript,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  return (
    <div className="w-full my-2.5 rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-xl bg-white dark:bg-[#141417] transition-all">
      {/* 1. TOP HEADER BANNER WITH GRADIENT */}
      <div className={`px-5 py-4 text-white relative overflow-hidden ${
        isBuy
          ? 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 shadow-emerald-500/25'
          : isSell
          ? 'bg-gradient-to-r from-rose-600 via-red-600 to-amber-700 shadow-rose-500/25'
          : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 shadow-amber-500/25'
      }`}>
        {/* Ambient Glow */}
        <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/15 blur-2xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <span className="flex h-3.5 w-3.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isBuy ? 'bg-emerald-200' : isSell ? 'bg-rose-200' : 'bg-amber-200'
              }`}></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white"></span>
            </span>

            <div>
              <div className="text-[11px] font-bold tracking-widest uppercase opacity-85">
                Institutional Position Signal
              </div>
              <div className="text-2xl font-black tracking-tight drop-shadow-sm flex items-center gap-2">
                <span>{isBuy ? '🟢' : isSell ? '🔴' : '⏸️'}</span>
                <span>{action}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Audio Assistant Speaker Button */}
            <button
              onClick={handleVoicePlay}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                isSpeaking
                  ? 'bg-white text-black shadow-lg scale-105'
                  : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
              }`}
              title="Listen to trade signal aloud"
            >
              <span>{isSpeaking ? '⏹️' : '🔊'}</span>
              <span>{isSpeaking ? 'Stop Voice' : 'Listen'}</span>
            </button>

            {confidence && (
              <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold border border-white/30">
                Confidence: {confidence}
              </div>
            )}
            {market && market !== 'Unknown' && (
              <div className="bg-black/35 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                {market}
              </div>
            )}
            {timeframe && timeframe !== 'Not visible' && (
              <div className="bg-black/35 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium border border-white/20">
                {timeframe}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. CORE TRADE POSITION & EXECUTION NUMBERS */}
      <div className="p-4 sm:p-5 space-y-4 bg-slate-50/70 dark:bg-[#101012]">
        {!isWait ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* ENTRY ZONE CARD */}
            {entry && (
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1e] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  <span>Position Entry Zone</span>
                  <span className="text-indigo-500 font-bold">⚡</span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {entry}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
                  Execute limit/market order in zone
                </div>
              </div>
            )}

            {/* PROTECTIVE STOP LOSS CARD — VIBRANT RED GRADIENT */}
            {stopLoss && (
              <div className="p-3.5 rounded-xl border-2 border-red-500/40 dark:border-red-500/50 bg-gradient-to-br from-rose-50 via-red-50 to-rose-100/90 dark:from-red-950/40 dark:via-rose-950/30 dark:to-red-900/40 shadow-sm shadow-red-100 dark:shadow-none flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-extrabold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1">
                  <span>Protective Stop Loss</span>
                  <span className="text-red-600 dark:text-red-400 font-bold">🛡️</span>
                </div>
                <div className="text-lg font-black text-red-900 dark:text-red-300 tracking-tight">
                  {stopLoss}
                </div>
                <div className="text-[10px] text-red-700/80 dark:text-red-400/80 mt-1 font-medium">
                  Strict Capital Defense Level
                </div>
              </div>
            )}

            {/* RISK / REWARD */}
            {riskReward && (
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#1a1a1e] shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  <span>Risk / Reward Ratio</span>
                  <span className="text-slate-400">⚖️</span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {riskReward}
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
                  Favorable Asymmetric Edge
                </div>
              </div>
            )}

            {/* TAKE PROFIT TARGETS — VIBRANT GREEN GRADIENTS */}
            {takeProfits.map((tp, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border-2 border-emerald-500/40 dark:border-emerald-500/50 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100/90 dark:from-emerald-950/40 dark:via-green-950/30 dark:to-teal-900/40 shadow-sm shadow-emerald-100 dark:shadow-none flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1">
                  <span>{tp.label}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">🎯</span>
                </div>
                <div className="text-lg font-black text-emerald-950 dark:text-emerald-300 tracking-tight">
                  {tp.value}
                </div>
                <div className="text-[10px] text-emerald-700/90 dark:text-emerald-400/80 mt-1 font-medium">
                  {tp.targetNote}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* WAIT / CONSOLIDATION WATCH TRIGGERS */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {watchBuy && (
              <div className="p-4 rounded-xl border-2 border-emerald-500/30 dark:border-emerald-500/40 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 shadow-sm">
                <div className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400 uppercase mb-1">Trigger Level For Buy (Long)</div>
                <div className="text-base font-black text-emerald-950 dark:text-emerald-300">{watchBuy}</div>
              </div>
            )}
            {watchSell && (
              <div className="p-4 rounded-xl border-2 border-rose-500/30 dark:border-rose-500/40 bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/20 shadow-sm">
                <div className="text-xs font-extrabold text-red-800 dark:text-red-400 uppercase mb-1">Trigger Level For Sell (Short)</div>
                <div className="text-base font-black text-red-950 dark:text-red-300">{watchSell}</div>
              </div>
            )}
          </div>
        )}

        {/* 3. TRADE MANAGEMENT & POSITION SIZING ADVICE */}
        {!isWait && (
          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/50 text-xs text-blue-900 dark:text-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-700 dark:text-blue-400">📊 Position Sizing Rule:</span>
              <span>Risk maximum 1.0% – 2.0% of total trading account equity per position.</span>
            </div>
            <div className="text-[11px] font-semibold text-blue-800 dark:text-blue-300 bg-white/70 dark:bg-black/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
              Trailing SL Rule: Breakeven at TP1
            </div>
          </div>
        )}

        {/* 4. QUICK SETUP BULLETS */}
        {bullets && bullets.length > 0 && (
          <div className="bg-white dark:bg-[#1a1a1e] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span>⚡</span> High-Conviction Technical Setup
            </div>
            <ul className="space-y-1.5 text-sm text-slate-800 dark:text-zinc-200">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 5. INVALIDATION LEVEL */}
        {invalidation && (
          <div className="px-3.5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <span className="font-bold text-amber-700 dark:text-amber-400">⚠️ Invalidation:</span>
            <span>{invalidation}</span>
          </div>
        )}

        {/* 6. LEGAL & FINANCIAL REGULATORY DISCLOSURE */}
        <div className="pt-1 text-center">
          <button
            onClick={() => setShowLegalNotice(!showLegalNotice)}
            className="text-[11px] text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200 underline transition-colors"
          >
            {showLegalNotice ? 'Hide Regulatory & Legal Disclosure' : '⚖️ Financial & Legal Regulatory Notice'}
          </button>

          {showLegalNotice && (
            <div className="mt-2 p-3 rounded-lg bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-[11px] text-gray-600 dark:text-zinc-400 text-left leading-relaxed">
              <strong>Legal & Risk Disclaimer:</strong> TradeX AI provides algorithmic, technical, and educational market analysis. The information, signals, and price zones presented are generated via artificial intelligence and strictly intended for analytical and illustrative reference. They do <strong>not</strong> constitute certified financial advice, investment counsel, endorsement of securities, or legal recommendations under applicable securities regulations. Trading in stocks, commodities, forex, and cryptocurrency involves significant market risk and can result in partial or total loss of capital. Always perform your independent due diligence or consult a licensed financial advisor before executing market orders.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
