import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { Card } from '../components/ui/Card';
import { RiderAvatar } from '../components/ui/RiderAvatar';
import { RIDERS_2026 } from '../data/riders2026';
import { TEAMS_2026 } from '../data/teams2026';

export function Championship() {
  const { season, character } = useGameStore();
  const [tab, setTab] = useState<'riders' | 'constructors'>('riders');

  if (!season || !character) return null;

  const topRiders = season.driverStandings.slice(0, 22);
  const topConstructors = season.constructorStandings.slice(0, 5);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-orbitron font-black text-2xl text-white mb-2">Campeonato 2026</h1>
        <p className="text-gray-500 text-sm mb-4">Ronda {Math.min(season.currentRound - 1, 22)} de 22</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(['riders', 'constructors'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-motogp-red text-white' : 'bg-white/10 text-gray-400 hover:text-white'}`}
            >
              {t === 'riders' ? '🏍️ Pilotos' : '🏭 Constructores'}
            </button>
          ))}
        </div>

        {tab === 'riders' && (
          <Card>
            <div className="space-y-1">
              {topRiders.map((s, i) => {
                const rider = RIDERS_2026.find(r => r.id === s.riderId);
                const isPlayer = s.riderId === character.id;
                const team = TEAMS_2026.find(t => t.id === rider?.teamId);
                const playerTeam = TEAMS_2026.find(t => t.id === character.teamId);
                return (
                  <motion.div
                    key={s.riderId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={`flex items-center gap-3 p-3 rounded-lg ${isPlayer ? 'bg-motogp-red/15 border border-motogp-red/25' : i % 2 === 0 ? 'bg-white/3' : ''}`}
                  >
                    <span className={`w-7 text-center font-orbitron font-bold text-sm flex-shrink-0 ${
                      i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'
                    }`}>{i + 1}</span>

                    <RiderAvatar
                      photoUrl={isPlayer ? undefined : rider?.photoUrl}
                      name={isPlayer ? `${character.nombre} ${character.apellido}` : `${rider?.name ?? ''} ${rider?.surname ?? ''}`}
                      number={isPlayer ? character.numero : (rider?.number ?? 0)}
                      teamColor={isPlayer ? playerTeam?.color : team?.color}
                      size="sm"
                    />

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isPlayer ? 'text-motogp-red font-bold' : 'text-white'}`}>
                        {isPlayer ? `${character.nombre} ${character.apellido}` : `${rider?.name ?? ''} ${rider?.surname ?? ''}`}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {isPlayer ? playerTeam?.shortName : team?.shortName} · #{isPlayer ? character.numero : rider?.number}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-white">{s.points}</p>
                      <div className="flex gap-1 text-xs text-gray-500">
                        <span>{s.wins}V</span>
                        <span>{s.podiums}P</span>
                        <span>{s.poles}Q</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        )}

        {tab === 'constructors' && (
          <Card>
            <div className="space-y-3">
              {topConstructors.map((c, i) => {
                const teamEntry = TEAMS_2026.find(t => t.manufacturer === c.manufacturer && t.tier === 'elite') ??
                  TEAMS_2026.find(t => t.manufacturer === c.manufacturer);
                const maxPoints = topConstructors[0]?.points || 1;
                return (
                  <motion.div key={c.manufacturer} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-orbitron font-bold text-sm text-gray-500 w-6 flex-shrink-0">{i + 1}</span>
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: teamEntry?.color ?? '#888' }} />
                      <span className="flex-1 text-white font-medium">{c.manufacturer}</span>
                      <span className="font-bold text-white">{c.points}</span>
                      <span className="text-xs text-gray-500">{c.wins}V</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden ml-9">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${(c.points / maxPoints) * 100}%`, backgroundColor: teamEntry?.color ?? '#888' }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
