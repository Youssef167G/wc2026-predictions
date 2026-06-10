import { useState } from 'react';
import { flags } from '../data/groups.js';

const RANK_CLASS = ['rank-1', 'rank-2', 'rank-3', 'rank-4'];
const RANK_BG = [
  'bg-yellow-500/10',
  'bg-gray-400/10',
  'bg-amber-700/10',
  'bg-white/[0.03]',
];

export default function GroupCard({ letter, groupData, onChange, thirdQualifiesCount }) {
  const { ranking, thirdQualifies, confirmed } = groupData;
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  /* ── Drag & Drop (desktop) ── */
  const onDragStart = (idx) => (e) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (idx) => (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (idx !== dragOverIdx) setDragOverIdx(idx);
  };

  const onDrop = (idx) => (e) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }
    const next = [...ranking];
    const [removed] = next.splice(draggedIdx, 1);
    next.splice(idx, 0, removed);
    onChange({ ...groupData, ranking: next, confirmed: false });
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const onDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  /* ── Arrow buttons (mobile / keyboard) ── */
  const moveTeam = (idx, dir) => {
    const nxt = idx + dir;
    if (nxt < 0 || nxt >= ranking.length) return;
    const next = [...ranking];
    [next[idx], next[nxt]] = [next[nxt], next[idx]];
    onChange({ ...groupData, ranking: next, confirmed: false });
  };

  /* ── Third-place qualifier toggle ── */
  const toggleThird = () => {
    if (!thirdQualifies && thirdQualifiesCount >= 8) return;
    onChange({ ...groupData, thirdQualifies: !thirdQualifies });
  };

  const confirmGroup = () => onChange({ ...groupData, confirmed: true });
  const editGroup   = () => onChange({ ...groupData, confirmed: false });

  return (
    <div
      className={`glass-card-dark p-4 flex flex-col transition-all duration-300 ${
        confirmed ? 'group-confirmed' : ''
      }`}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[#FFD700] font-black text-base tracking-[0.18em]">
          GROUP {letter}
        </h3>
        {confirmed ? (
          <span className="text-green-400 text-xs font-semibold flex items-center gap-1">
            ✅ Confirmed
          </span>
        ) : (
          <span className="text-white/30 text-[10px] uppercase tracking-widest">
            Drag to rank
          </span>
        )}
      </div>

      {/* ── Team rows ── */}
      <div className="space-y-1.5 flex-1 mb-3">
        {ranking.map((team, idx) => (
          <div
            key={team}
            draggable
            onDragStart={onDragStart(idx)}
            onDragOver={onDragOver(idx)}
            onDrop={onDrop(idx)}
            onDragEnd={onDragEnd}
            onDragLeave={() => setDragOverIdx(null)}
            className={[
              'team-row flex items-center gap-2 px-2 py-1.5 rounded-lg',
              RANK_BG[idx],
              draggedIdx === idx ? 'is-dragging' : '',
              dragOverIdx === idx && draggedIdx !== idx ? 'drag-target' : '',
            ].join(' ')}
          >
            {/* Drag handle — hidden on mobile */}
            <span className="hidden sm:block text-white/25 text-sm select-none cursor-grab">
              ⠿
            </span>

            {/* Rank badge */}
            <div className={`rank-badge ${RANK_CLASS[idx]}`}>{idx + 1}</div>

            {/* Flag */}
            <span className="text-lg leading-none">{flags[team] ?? '🏳️'}</span>

            {/* Team name */}
            <span className="text-white text-sm font-medium flex-1 leading-tight">
              {team}
            </span>

            {/* 3rd-place qualifier button */}
            {idx === 2 && (
              <button
                onClick={toggleThird}
                title={
                  thirdQualifies
                    ? 'Remove best-3rd qualifier'
                    : thirdQualifiesCount >= 8
                    ? 'Already selected 8 best-3rd qualifiers'
                    : 'Mark as best-3rd qualifier'
                }
                className={[
                  'text-[10px] px-2 py-0.5 rounded-full border transition-all shrink-0',
                  thirdQualifies
                    ? 'bg-[#00A3E0]/20 border-[#00A3E0] text-[#00A3E0] font-semibold'
                    : thirdQualifiesCount >= 8
                    ? 'border-white/10 text-white/20 cursor-not-allowed'
                    : 'border-white/20 text-white/40 hover:border-white/50 hover:text-white/70',
                ].join(' ')}
              >
                {thirdQualifies ? '✓ Best 3rd' : '+ Best 3rd?'}
              </button>
            )}

            {/* Up / Down buttons (always on mobile, hidden on desktop) */}
            <div className="flex flex-col gap-px sm:hidden shrink-0">
              <button
                onClick={() => moveTeam(idx, -1)}
                disabled={idx === 0}
                className="text-white/40 hover:text-white disabled:opacity-20 text-[10px] leading-3 px-0.5"
              >
                ▲
              </button>
              <button
                onClick={() => moveTeam(idx, 1)}
                disabled={idx === ranking.length - 1}
                className="text-white/40 hover:text-white disabled:opacity-20 text-[10px] leading-3 px-0.5"
              >
                ▼
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Confirm / Edit ── */}
      {confirmed ? (
        <button
          onClick={editGroup}
          className="w-full text-[11px] py-1.5 rounded-lg border border-green-500/20 text-green-400/50 hover:text-green-400 hover:border-green-500/50 transition-all"
        >
          Edit Group
        </button>
      ) : (
        <button
          onClick={confirmGroup}
          className="w-full text-sm py-2 rounded-lg border border-[#FFD700]/30 text-[#FFD700]/70 hover:text-[#FFD700] hover:border-[#FFD700] hover:bg-[#FFD700]/5 transition-all font-medium"
        >
          Confirm Group ✓
        </button>
      )}
    </div>
  );
}
