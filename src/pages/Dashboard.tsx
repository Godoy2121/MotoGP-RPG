import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flag, Trophy, Star, ChevronRight, Zap } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { Card } from '../components/ui/Card';
import { XPBar } from '../components/ui/XPBar';
import { StatBar } from '../components/ui/StatBar';
import { TEAMS_2026 } from '../data/teams2026';
import { CIRCUITS_2026, getCircuitByRound } from '../data/circuits2026';
import { RIDERS_2026 } from '../data/riders2026';
import { OBJECTIVES } from '../data/objectives';

export function Dashboard() {
  const { character, season } = useGameStore();
  const navigate = useNavigate();
  const [showTransfer, setShowTransfer] = useState(false);
  void showTransfer;

  if (!character || !season) return null;

  const team = TEAMS_2026.find(t => t.id === character.teamId);
  const nextCircuit = getCircuitByRound(season.currentRound);
  const isSeasonOver = season.currentRound > 22;

  const playerStanding = season.driverStandings.find(s => s.riderId === character.id);
  const playerPosition = playerStanding
    ? season.driverStandings.findIndex(s => s.riderId === character.id) + 1
    : '-';

  const availableObjectives = OBJECTIVES.filter(obj =>
    obj.tierTarget.includes(team?.tier ?? 'backmarker') &&
    !season.claimedObjectiveIds.includes(obj.id)
  );

  const recentRaces = [...season.completedRaces].reverse().slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
      {/* Hero: Piloto + Equipo */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card glow className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10" style={{ backgroundColor: team?.color }} />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 font-orbitron mb-1">{team?.manufacturer} · {team?.name}</p>
              <h1 className="font-orbitron font-black text-2xl text-white">
                #{character.numero} {character.apellido}
              </h1>
              <p className="text-gray-400 text-sm">{character.nombre} · {character.nacionalidad}</p>
              <div className="mt-3">
                <XPBar xp={character.xp} xpToNext={character.xpToNextLevel} level={character.level} />
              </div>
              {character.statPoints > 0 && (
                <button onClick={() => navigate('/profile')} className="mt-2 text-xs bg-motogp-red/20 text-motogp-red border border-motogp-red/30 rounded px-2 py-1 animate-pulse">
                  +{character.statPoints} puntos disponibles →
                </button>
              )}
            </div>
            <div className="text-right">
              <div className="text-3xl font-black font-orbitron" style={{ color: team?.color }}>
                {playerPosition === '-' ? '-' : `P${playerPosition}`}
              </div>
              <div className="text-xs text-gray-500">Campeonato</div>
              <div className="text-sm font-bold text-white mt-1">{playerStanding?.points ?? 0} pts</div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Próxima carrera */}
      {!isSeasonOver && nextCircuit && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flag size={16} className="text-motogp-red" />
                <span className="text-sm font-bold text-white font-orbitron">Próxima Carrera</span>
              </div>
              <span className="text-xs text-gray-500">Ronda {season.currentRound}/22</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl">{nextCircuit.flagEmoji}</p>
                <p className="text-white font-bold">{nextCircuit.name}</p>
                <p className="text-xs text-gray-500">{nextCircuit.city} · {nextCircuit.laps} vueltas · {nextCircuit.length} km</p>
                <div className="flex gap-3 mt-2 text-xs text-gray-500">
                  <span>🌧️ Lluvia: {nextCircuit.weatherProbability}%</span>
                  <span>💥 Adelantos: {nextCircuit.overtakingDifficulty > 70 ? 'Difícil' : nextCircuit.overtakingDifficulty > 45 ? 'Medio' : 'Fácil'}</span>
                  {nextCircuit.hasSprint && <span className="text-orange-400">⚡ Sprint</span>}
                </div>
              </div>
              <button
                onClick={() => navigate('/race')}
                className="btn-primary flex items-center gap-2 px-5 py-3"
              >
                <Zap size={16} />
                ¡Correr!
              </button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Fin de temporada */}
      {isSeasonOver && season.phase !== 'post_season' && (
        <Card glow className="text-center">
          <p className="text-3xl mb-2">🏆</p>
          <h2 className="font-orbitron text-xl text-white mb-1">¡Temporada Completada!</h2>
          <p className="text-gray-400 text-sm mb-4">
            Terminaste en P{playerPosition} del Campeonato del Mundo con {playerStanding?.points ?? 0} puntos.
          </p>
          <button onClick={() => setShowTransfer(true)} className="btn-primary px-6 py-3">
            Ver mercado de fichajes →
          </button>
        </Card>
      )}

      {/* Stats rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Victorias', value: playerStanding?.wins ?? 0, icon: '🏆' },
          { label: 'Podios', value: playerStanding?.podiums ?? 0, icon: '🥉' },
          { label: 'Poles', value: playerStanding?.poles ?? 0, icon: '⚡' },
          { label: 'Carreras', value: season.completedRaces.length, icon: '🏁' },
        ].map(s => (
          <Card key={s.label} className="text-center">
            <p className="text-2xl">{s.icon}</p>
            <p className="text-2xl font-black font-orbitron text-white">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Clasificación global (top 5) */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-yellow-400" />
              <span className="text-sm font-bold text-white font-orbitron">Clasificación Mundial</span>
            </div>
            <button onClick={() => navigate('/championship')} className="text-xs text-motogp-red flex items-center gap-1">
              Ver todo <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {season.driverStandings.slice(0, 5).map((s, i) => {
              const rider = RIDERS_2026.find(r => r.id === s.riderId);
              const isPlayer = s.riderId === character.id;
              return (
                <div key={s.riderId} className={`flex items-center gap-3 p-2 rounded-lg ${isPlayer ? 'bg-motogp-red/10 border border-motogp-red/20' : ''}`}>
                  <span className={`w-6 text-center font-bold font-orbitron text-sm ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-500'}`}>{i + 1}</span>
                  <span className="text-base">{isPlayer ? '🏍️' : (rider?.flagEmoji ?? '🏁')}</span>
                  <span className={`flex-1 text-sm ${isPlayer ? 'text-motogp-red font-bold' : 'text-white'}`}>
                    {isPlayer ? `${character.nombre} ${character.apellido}` : `${rider?.name ?? ''} ${rider?.surname ?? ''}`}
                  </span>
                  <span className="text-sm font-bold text-white">{s.points}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Objetivos */}
      {availableObjectives.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Star size={16} className="text-yellow-400" />
            <span className="text-sm font-bold text-white font-orbitron">Objetivos de Temporada</span>
          </div>
          <div className="space-y-2">
            {availableObjectives.slice(0, 3).map(obj => (
              <div key={obj.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                <div>
                  <p className="text-sm text-white font-medium">{obj.name}</p>
                  <p className="text-xs text-gray-500">{obj.description}</p>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <p className="text-yellow-400 font-bold">+{obj.reward.xp} XP</p>
                  {obj.reward.statPoints > 0 && <p>+{obj.reward.statPoints} pts</p>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Últimas carreras */}
      {recentRaces.length > 0 && (
        <Card>
          <h3 className="text-sm font-bold text-white font-orbitron mb-3">Últimos Resultados</h3>
          <div className="space-y-2">
            {recentRaces.map(race => {
              const circuit = CIRCUITS_2026.find(c => c.id === race.circuitId);
              const pos = race.playerResult?.finishPosition ?? 99;
              return (
                <div key={race.completedAt} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                  <span className="text-lg">{circuit?.flagEmoji}</span>
                  <span className="text-sm text-gray-400 flex-1">{circuit?.country}</span>
                  <span className={`font-bold font-orbitron text-sm ${pos === 1 ? 'text-yellow-400' : pos <= 3 ? 'text-orange-400' : pos <= 10 ? 'text-white' : pos === 99 ? 'text-red-400' : 'text-gray-400'}`}>
                    {pos === 99 ? 'DNF' : `P${pos}`}
                  </span>
                  <span className="text-xs text-gray-500">{race.playerResult?.points ?? 0} pts</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Stats del piloto */}
      <Card>
        <h3 className="text-sm font-bold text-white font-orbitron mb-3">Stats del Piloto</h3>
        <div className="grid grid-cols-2 gap-x-6">
          <StatBar label="Velocidad" value={character.stats.velocidad} icon="⚡" />
          <StatBar label="Frenada" value={character.stats.frenada} icon="🛑" />
          <StatBar label="Paso por Curva" value={character.stats.pasoCurva} icon="🔄" />
          <StatBar label="Aceleración" value={character.stats.aceleracion} icon="🚀" />
          <StatBar label="Tiempo Mojado" value={character.stats.tiempoMojado} icon="🌧️" />
          <StatBar label="Gest. Neumáticos" value={character.stats.gestionNeumaticos} icon="🔵" />
        </div>
      </Card>
    </div>
  );
}
