import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const TOURNAMENT_START = new Date('2026-06-11T00:00:00');

function useCountdown() {
  const [time, setTime] = useState(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = TOURNAMENT_START - Date.now();
      if (diff <= 0) { setStarted(true); return; }
      setTime({
        days:    Math.floor(diff / 86_400_000),
        hours:   Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return { time, started };
}

export default function LandingPage() {
  const [name, setName]               = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [existingUser, setExistingUser] = useState(null);
  const navigate                       = useNavigate();
  const { time, started }              = useCountdown();
  const inputRef                       = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/predictions/${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        setExistingUser(await res.json());
      } else if (res.status === 404) {
        navigate(`/predict?name=${encodeURIComponent(trimmed)}`);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Cannot reach the server. Make sure the backend is running on port 3001.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg min-h-screen overflow-hidden relative">

      {/* Decorative background balls */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none">
        {[
          { top: '8%',  left: '6%',  size: '5rem', delay: '0s' },
          { top: '15%', right: '8%', size: '3.5rem', delay: '1.2s' },
          { top: '50%', left: '3%', size: '4rem', delay: '0.6s' },
          { bottom: '20%', right: '5%', size: '6rem', delay: '0.9s' },
          { bottom: '8%', left: '15%', size: '3rem', delay: '1.5s' },
        ].map((style, i) => (
          <div
            key={i}
            className="absolute float-animation opacity-[0.07] text-white"
            style={{ ...style, fontSize: style.size, animationDelay: style.delay }}
          >
            ⚽
          </div>
        ))}
        {/* Glowing orbs */}
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#00A3E0]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">

        {/* ── Hero ── */}
        <div className="text-center mb-10 fade-in">
          <p className="text-[#00A3E0] text-xs tracking-[0.35em] uppercase font-semibold mb-3">
            FIFA World Cup 2026™
          </p>
          <div className="flex items-center justify-center gap-4 mb-2">
            <span className="text-5xl glow-gold">🏆</span>
            <h1 className="text-6xl md:text-8xl font-black shimmer-text leading-none tracking-tight">
              WE ARE 26
            </h1>
            <span className="text-5xl glow-gold">🏆</span>
          </div>
          <p className="text-white/55 text-sm tracking-[0.25em] uppercase mt-3">
            🇺🇸 United States &nbsp;·&nbsp; 🇨🇦 Canada &nbsp;·&nbsp; 🇲🇽 Mexico
          </p>
          <p className="text-white/35 text-xs mt-1">Group Stage Prediction Challenge</p>
        </div>

        {/* ── Mascots ── */}
        <div className="flex gap-8 mb-10 fade-in" style={{ animationDelay: '0.1s' }}>
          {[
            { emoji: '🦅', name: 'Clutch',  flag: '🇺🇸', country: 'USA' },
            { emoji: '🐆', name: 'Zayu',    flag: '🇲🇽', country: 'Mexico' },
            { emoji: '🫎', name: 'Maple',   flag: '🇨🇦', country: 'Canada' },
          ].map((m) => (
            <div key={m.name} className="text-center group">
              <div className="text-4xl mb-1 transition-transform group-hover:scale-125 duration-200">
                {m.emoji}
              </div>
              <div className="text-white/65 text-xs font-medium">{m.name}</div>
              <div className="text-[#FFD700] text-[11px]">{m.flag} {m.country}</div>
            </div>
          ))}
        </div>

        {/* ── Countdown ── */}
        <div className="glass-card px-8 py-6 mb-8 text-center fade-in" style={{ animationDelay: '0.15s' }}>
          {started ? (
            <div className="text-2xl font-black text-[#FFD700] tracking-wide">
              Tournament underway! 🔥
            </div>
          ) : time ? (
            <>
              <p className="text-white/45 text-[11px] tracking-[0.3em] uppercase mb-4">
                Tournament kicks off in
              </p>
              <div className="flex items-end gap-3">
                {[
                  { v: time.days,    l: 'Days' },
                  { v: time.hours,   l: 'Hrs' },
                  { v: time.minutes, l: 'Min' },
                  { v: time.seconds, l: 'Sec' },
                ].map(({ v, l }) => (
                  <div key={l} className="text-center">
                    <div className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 min-w-[54px]">
                      <span className="text-3xl font-black text-[#FFD700] tabular-nums">
                        {String(v).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="text-white/40 text-[10px] mt-1">{l}</div>
                  </div>
                ))}
              </div>
              <p className="text-white/30 text-[11px] mt-4">
                Opening match: June 11, 2026
              </p>
            </>
          ) : (
            <div className="h-16 flex items-center justify-center text-white/30 text-sm">
              Loading…
            </div>
          )}
        </div>

        {/* ── Name entry / returning user ── */}
        <div className="w-full max-w-md fade-in" style={{ animationDelay: '0.2s' }}>
          {!existingUser ? (
            <div className="glass-card p-8">
              <h2 className="text-xl font-bold text-white text-center mb-1">
                Make Your Predictions
              </h2>
              <p className="text-white/45 text-sm text-center mb-6">
                Rank all 4 teams in each of the 12 groups
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  placeholder="Enter your name…"
                  maxLength={50}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/35 focus:outline-none transition-all text-base"
                />
                {error && (
                  <p className="text-red-400 text-sm flex items-center gap-1">
                    <span>⚠️</span> {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="btn-primary w-full text-base"
                >
                  {loading ? '⏳ Checking…' : 'Start Predicting →'}
                </button>
              </form>
            </div>
          ) : (
            <div className="glass-card p-8 text-center fade-in">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FFD700] to-[#00A3E0] flex items-center justify-center text-[#0A1628] font-black text-2xl mx-auto mb-4">
                {existingUser.name[0].toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-white mb-1">
                Welcome back, {existingUser.name}!
              </h2>
              <p className="text-white/45 text-sm mb-6">
                You already have predictions saved.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate('/predictions')}
                  className="btn-primary"
                >
                  📋 View All Predictions
                </button>
                <button
                  onClick={() =>
                    navigate(`/predict?name=${encodeURIComponent(existingUser.name)}&edit=true`)
                  }
                  className="btn-secondary"
                >
                  ✏️ Edit My Predictions
                </button>
                <button
                  onClick={() => { setExistingUser(null); setName(''); }}
                  className="text-white/35 text-sm hover:text-white/70 transition-colors mt-1"
                >
                  Use a different name
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── View all link ── */}
        <button
          onClick={() => navigate('/predictions')}
          className="mt-8 text-[#00A3E0] hover:text-white transition-colors text-sm underline underline-offset-4 fade-in"
          style={{ animationDelay: '0.3s' }}
        >
          👁 See everyone's predictions →
        </button>

        {/* ── Footer ── */}
        <footer
          className="mt-12 text-center text-white/25 text-[11px] space-y-1 fade-in"
          style={{ animationDelay: '0.4s' }}
        >
          <p>FIFA World Cup 2026™ &nbsp;|&nbsp; 48 teams · 104 matches · 3 host nations</p>
          <p>Built for fans, by fans &nbsp;⚽</p>
        </footer>
      </div>
    </div>
  );
}
