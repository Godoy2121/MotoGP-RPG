import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { Card } from '../components/ui/Card';
import { getLeaderboard } from '../services/gameService';
import type { LeaderboardEntry } from '../types';

export function Leaderboard() {
  const { user, leaderboard, setLeaderboard } = useGameStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard(50).then(data => {
      setLeaderboard(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [setLeaderboard]);

  const entries: LeaderboardEntry[] = leaderboard;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="text-yellow-400" size={20} />
        <h1 className="font-orbitron font-black text-2xl text-white">Ranking Global</h1>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Cargando ranking...</div>
      ) : entries.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-4xl mb-3">🏍️</p>
          <p className="text-gray-400">Sé el primero en aparecer en el ranking</p>
          <p className="text-xs text-gray-600 mt-2">Juega y termina una carrera para aparecer aquí</p>
        </Card>
      ) : (
        <Card>
          <div className="space-y-1">
            {entries.map((entry, i) => {
              const isMe = entry.userId === user?.uid;
              return (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-3 p-3 rounded-lg ${isMe ? 'bg-motogp-red/15 border border-motogp-red/25' : i % 2 === 0 ? 'bg-white/3' : ''}`}
                >
                  <span className={`w-8 text-center font-orbitron font-bold text-sm flex-shrink-0 ${
                    i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'
                  }`}>
                    {i + 1}
                  </span>

                  {entry.photoURL ? (
                    <img src={entry.photoURL} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-motogp-red/20 flex items-center justify-center text-sm flex-shrink-0">
                      {entry.displayName[0]?.toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isMe ? 'text-motogp-red font-bold' : 'text-white'}`}>
                      {entry.displayName} {isMe && '(Tú)'}
                    </p>
                    <p className="text-xs text-gray-500">{entry.totalWins} victorias · {entry.championships} títulos</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-white">{entry.totalPoints.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">pts</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
