import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GroupCard from '../components/GroupCard.jsx';
import { groups, groupLetters } from '../data/groups.js';

const LS_KEY = 'wc2026_draft_';

function makeDefault() {
  const result = {};
  groupLetters.forEach((l) => {
    result[l] = { ranking: [...groups[l]], thirdQualifies: false, confirmed: false };
  });
  return result;
}

function hydrate(saved) {
  const base = makeDefault();
  if (!saved) return base;
  groupLetters.forEach((l) => {
    if (saved[l]) {
      base[l] = {
        ranking:       Array.isArray(saved[l].ranking) ? saved[l].ranking : base[l].ranking,
        thirdQualifies: !!saved[l].thirdQualifies,
        confirmed:      !!saved[l].confirmed,
      };
    }
  });
  return base;
}

export default function PredictionForm() {
  const [params]              = useSearchParams();
  const name                   = params.get('name') ?? '';
  const isEdit                 = params.get('edit') === 'true';
  const navigate               = useNavigate();

  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [saved,  setSaved]            = useState(false);
  const [error,  setError]            = useState('');

  /* ── Load on mount ── */
  useEffect(() => {
    if (!name) { navigate('/'); return; }

    const fromLS = localStorage.getItem(LS_KEY + name);

    if (isEdit) {
      fetch(`/api/predictions/${encodeURIComponent(name)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          setPredictions(hydrate(data?.predictions ?? (fromLS ? JSON.parse(fromLS) : null)));
        })
        .catch(() => {
          setPredictions(hydrate(fromLS ? JSON.parse(fromLS) : null));
        })
        .finally(() => setLoading(false));
    } else {
      setPredictions(hydrate(fromLS ? JSON.parse(fromLS) : null));
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Auto-save to localStorage ── */
  useEffect(() => {
    if (predictions && name) {
      localStorage.setItem(LS_KEY + name, JSON.stringify(predictions));
    }
  }, [predictions, name]);

  const updateGroup = useCallback((letter, data) => {
    setPredictions((prev) => ({ ...prev, [letter]: data }));
  }, []);

  /* ── Derived stats ── */
  const confirmedCount      = predictions ? Object.values(predictions).filter((g) => g.confirmed).length : 0;
  const thirdQualifiesCount = predictions ? Object.values(predictions).filter((g) => g.thirdQualifies).length : 0;
  const allConfirmed         = confirmedCount === 12;
  const tooManyThirds        = thirdQualifiesCount > 8;

  /* ── Save ── */
  const handleSave = async () => {
    if (!allConfirmed || tooManyThirds) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, predictions }),
      });
      if (!res.ok) throw new Error('Save failed');
      localStorage.removeItem(LS_KEY + name);
      setSaved(true);
      setTimeout(() => navigate('/predictions'), 2000);
    } catch {
      setError('Failed to save. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center">
        <div className="text-white/60 text-lg animate-pulse">Loading…</div>
      </div>
    );
  }

  return (
    <div className="gradient-bg min-h-screen">

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-50 glass-card-dark border-b border-[#FFD700]/15 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/')}
              className="text-white/40 hover:text-white transition-colors text-sm shrink-0"
            >
              ← Home
            </button>
            <div className="min-w-0">
              <div className="text-[#FFD700] font-black text-sm truncate">
                🏆 WC2026 Predictions
              </div>
              <div className="text-white/45 text-xs truncate">{name}</div>
            </div>
          </div>

          <div className="flex items-center gap-5 shrink-0">
            {/* Groups progress */}
            <div className="text-center">
              <div className="text-[#FFD700] font-black text-xl leading-tight">{confirmedCount}/12</div>
              <div className="text-white/40 text-[10px]">Groups done</div>
            </div>
            {/* Best 3rds */}
            <div className={`text-center ${tooManyThirds ? 'text-red-400' : 'text-[#00A3E0]'}`}>
              <div className="font-black text-xl leading-tight">{thirdQualifiesCount}/8</div>
              <div className="text-[10px] opacity-60">Best 3rds</div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-7xl mx-auto mt-2">
          <div className="h-[3px] bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FFD700] to-[#00A3E0] rounded-full transition-all duration-500"
              style={{ width: `${(confirmedCount / 12) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Page title ── */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2">
            <span className="shimmer-text">Group Stage Predictions</span>
          </h1>
          <p className="text-white/50 text-sm">
            Drag teams to rank 1st – 4th within each group, then click Confirm
          </p>

          {/* Rank legend */}
          <div className="flex flex-wrap justify-center gap-5 mt-5 text-[11px] text-white/50">
            {[
              { cls: 'rank-1', label: '1st — qualifies' },
              { cls: 'rank-2', label: '2nd — qualifies' },
              { cls: 'rank-3', label: '3rd — best 3rd only' },
              { cls: 'rank-4', label: '4th — eliminated' },
            ].map(({ cls, label }) => (
              <div key={cls} className="flex items-center gap-1.5">
                <div className={`rank-badge ${cls}`}>{label[0]}</div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Groups grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {groupLetters.map((letter) => (
            <GroupCard
              key={letter}
              letter={letter}
              groupData={predictions[letter]}
              onChange={(data) => updateGroup(letter, data)}
              thirdQualifiesCount={thirdQualifiesCount}
            />
          ))}
        </div>

        {/* ── Qualification info banner ── */}
        <div className="glass-card p-4 mb-6 text-center">
          <p className="text-white/55 text-sm">
            <span className="text-green-400 font-semibold">24 teams</span> qualify via top-2 in each group
            &nbsp;+&nbsp;
            <span className="text-[#00A3E0] font-semibold">8 best 3rd-place teams</span>
            &nbsp;= <span className="text-[#FFD700] font-bold">32 teams</span> advance to Round of 32
          </p>
        </div>

        {/* ── Too-many-thirds warning ── */}
        {tooManyThirds && (
          <div className="glass-card p-4 mb-6 border border-red-500/50 text-center fade-in">
            <p className="text-red-400 font-semibold text-sm">
              ⚠️ You've selected {thirdQualifiesCount} best-3rd qualifiers — maximum is 8.
              Please deselect {thirdQualifiesCount - 8} group{thirdQualifiesCount - 8 > 1 ? 's' : ''}.
            </p>
          </div>
        )}

        {/* ── Save section ── */}
        <div className="text-center pb-12">
          {!allConfirmed && (
            <p className="text-white/40 text-sm mb-4">
              Confirm all 12 groups to unlock saving &nbsp;({confirmedCount}/12 done)
            </p>
          )}
          {error && (
            <p className="text-red-400 text-sm mb-4">⚠️ {error}</p>
          )}
          {saved ? (
            <div className="text-green-400 text-xl font-bold animate-pulse">
              ✅ Predictions saved! Redirecting…
            </div>
          ) : (
            <button
              onClick={handleSave}
              disabled={!allConfirmed || saving || tooManyThirds}
              className="btn-primary text-lg px-16 py-4"
            >
              {saving ? '⏳ Saving…' : '💾 Save My Predictions'}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
