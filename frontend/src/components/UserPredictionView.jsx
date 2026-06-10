import { groupLetters, flags } from '../data/groups.js';

const RANK_COLORS  = ['text-[#FFD700]', 'text-gray-300', 'text-amber-500', 'text-white/35'];
const RANK_LABELS  = ['1st', '2nd', '3rd', '4th'];
const RANK_BG      = ['bg-yellow-500/10', 'bg-gray-400/10', 'bg-amber-700/10', 'bg-white/[0.03]'];

export default function UserPredictionView({ data }) {
  const { name, predictions, created_at, updated_at } = data;

  const thirdQualifiers = groupLetters.filter((l) => predictions[l]?.thirdQualifies);
  const displayTime = new Date(updated_at || created_at).toLocaleString();

  return (
    <div className="fade-in">
      {/* ── Profile header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FFD700] to-[#00A3E0] flex items-center justify-center text-[#0A1628] font-black text-2xl shrink-0">
            {name[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">{name}'s Predictions</h2>
            <p className="text-white/40 text-sm">Submitted {displayTime}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="glass-card px-5 py-3 text-center">
            <div className="text-[#00A3E0] font-black text-2xl">{thirdQualifiers.length}</div>
            <div className="text-white/45 text-[11px] mt-0.5">Best 3rd picks</div>
          </div>
          <div className="glass-card px-5 py-3 text-center">
            <div className="text-[#FFD700] font-black text-2xl">32</div>
            <div className="text-white/45 text-[11px] mt-0.5">Total qualifiers</div>
          </div>
        </div>
      </div>

      {/* ── Qualification legend ── */}
      <div className="flex flex-wrap gap-3 mb-6 text-xs text-white/50">
        <span className="flex items-center gap-1.5">
          <span className="text-green-400 font-bold">✓</span> Auto-qualifies (1st & 2nd)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-[#00A3E0] font-bold">Q</span> Best 3rd qualifier
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-white/30">✗</span> Eliminated
        </span>
      </div>

      {/* ── Groups grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {groupLetters.map((letter) => {
          const group = predictions[letter];
          if (!group) return null;

          return (
            <div key={letter} className="glass-card-dark p-4">
              <h3 className="text-[#FFD700] font-black text-sm tracking-[0.18em] mb-3">
                GROUP {letter}
              </h3>

              <div className="space-y-1.5">
                {group.ranking.map((team, idx) => (
                  <div
                    key={team}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${RANK_BG[idx]}`}
                  >
                    <span className={`text-xs font-bold w-5 text-center shrink-0 ${RANK_COLORS[idx]}`}>
                      {idx + 1}
                    </span>
                    <span className="text-base leading-none">{flags[team] ?? '🏳️'}</span>
                    <span className="text-sm text-white font-medium flex-1 truncate">{team}</span>

                    {/* Status badge */}
                    {idx < 2 && (
                      <span className="text-green-400 text-xs shrink-0">✓</span>
                    )}
                    {idx === 2 && group.thirdQualifies && (
                      <span className="text-[#00A3E0] text-xs font-bold shrink-0">Q</span>
                    )}
                    {idx === 2 && !group.thirdQualifies && (
                      <span className="text-white/20 text-xs shrink-0">✗</span>
                    )}
                    {idx === 3 && (
                      <span className="text-white/20 text-xs shrink-0">✗</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Best 3rd summary ── */}
      {thirdQualifiers.length > 0 && (
        <div className="mt-6 glass-card p-5">
          <h3 className="text-[#00A3E0] font-bold mb-3 flex items-center gap-2">
            <span>Best 3rd Place Qualifiers</span>
            <span className="text-sm text-white/50">({thirdQualifiers.length}/8)</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {thirdQualifiers.map((letter) => {
              const team = predictions[letter]?.ranking[2];
              return (
                <span
                  key={letter}
                  className="bg-[#00A3E0]/15 border border-[#00A3E0]/35 rounded-full px-3 py-1 text-sm text-white flex items-center gap-1.5"
                >
                  <span>{flags[team]}</span>
                  <span>{team}</span>
                  <span className="text-[#00A3E0]/60 text-xs">(Group {letter})</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
