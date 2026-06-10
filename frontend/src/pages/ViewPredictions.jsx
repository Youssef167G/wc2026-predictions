import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserPredictionView from '../components/UserPredictionView.jsx';

export default function ViewPredictions() {
  const [users, setUsers]                 = useState([]);
  const [listLoading, setListLoading]     = useState(true);
  const [listError, setListError]         = useState('');
  const [selectedUser, setSelectedUser]   = useState(null);
  const [userPredictions, setUserPredictions] = useState(null);
  const [userLoading, setUserLoading]     = useState(false);
  const navigate                           = useNavigate();

  /* ── Load user list ── */
  useEffect(() => {
    fetch('/api/predictions')
      .then((r) => {
        if (!r.ok) throw new Error('Failed');
        return r.json();
      })
      .then((data) => { setUsers(data); setListLoading(false); })
      .catch(() => { setListError('Could not load predictions.'); setListLoading(false); });
  }, []);

  /* ── Open a user's predictions ── */
  const openUser = async (name) => {
    setSelectedUser(name);
    setUserPredictions(null);
    setUserLoading(true);
    try {
      const res = await fetch(`/api/predictions/${encodeURIComponent(name)}`);
      if (!res.ok) throw new Error('Not found');
      setUserPredictions(await res.json());
    } catch {
      setUserPredictions(null);
    } finally {
      setUserLoading(false);
    }
  };

  const closeUser = () => { setSelectedUser(null); setUserPredictions(null); };

  return (
    <div className="gradient-bg min-h-screen">

      {/* ── Header ── */}
      <header className="glass-card-dark border-b border-[#FFD700]/15 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={selectedUser ? closeUser : () => navigate('/')}
            className="text-white/40 hover:text-white transition-colors text-sm shrink-0"
          >
            ← {selectedUser ? 'Back to list' : 'Home'}
          </button>
          <div>
            <h1 className="text-[#FFD700] font-black text-lg leading-tight">
              🏆 WC2026 Predictions
            </h1>
            <p className="text-white/40 text-xs">
              {selectedUser
                ? `Viewing: ${selectedUser}`
                : `${users.length} prediction${users.length !== 1 ? 's' : ''} submitted`}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* ── Individual user view ── */}
        {selectedUser && (
          <>
            {userLoading && (
              <div className="text-center py-24 text-white/50 animate-pulse">
                Loading predictions…
              </div>
            )}
            {!userLoading && userPredictions && (
              <UserPredictionView data={userPredictions} />
            )}
            {!userLoading && !userPredictions && (
              <div className="text-center py-24 text-red-400">
                Could not load this user's predictions.
              </div>
            )}
          </>
        )}

        {/* ── User list ── */}
        {!selectedUser && (
          <>
            {listLoading && (
              <div className="text-center py-24 text-white/50 animate-pulse">
                Loading…
              </div>
            )}

            {!listLoading && listError && (
              <div className="text-center py-24">
                <p className="text-red-400 mb-4">{listError}</p>
                <button onClick={() => window.location.reload()} className="btn-secondary">
                  Retry
                </button>
              </div>
            )}

            {!listLoading && !listError && users.length === 0 && (
              <div className="text-center py-24 fade-in">
                <div className="text-7xl mb-4">🏆</div>
                <p className="text-white/55 text-xl font-semibold">No predictions yet</p>
                <p className="text-white/30 text-sm mt-2 mb-8">Be the first to submit!</p>
                <button onClick={() => navigate('/')} className="btn-primary">
                  Make Predictions
                </button>
              </div>
            )}

            {!listLoading && !listError && users.length > 0 && (
              <div className="fade-in">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {users.length} prediction{users.length !== 1 ? 's' : ''} submitted
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {users.map((user) => (
                    <button
                      key={user.name}
                      onClick={() => openUser(user.name)}
                      className="glass-card p-5 text-left hover:border-[#FFD700]/40 hover:bg-white/[0.08] transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FFD700] to-[#00A3E0] flex items-center justify-center text-[#0A1628] font-black text-lg shrink-0">
                          {user.name[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-white font-bold group-hover:text-[#FFD700] transition-colors truncate">
                            {user.name}
                          </div>
                          <div className="text-white/35 text-[11px]">Click to view ›</div>
                        </div>
                      </div>
                      <div className="text-white/25 text-[11px]">
                        {new Date(user.updated_at || user.created_at).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-8 text-center">
                  <button onClick={() => navigate('/')} className="btn-secondary text-sm">
                    + Add Your Predictions
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
