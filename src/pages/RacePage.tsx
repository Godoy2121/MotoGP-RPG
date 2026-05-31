import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useGameStore } from '../store/gameStore';
import { StartLights } from '../components/ui/StartLights';
import { Card } from '../components/ui/Card';
import {
  generateWeather, runQualifying, simulateRace,
  generateRaceEvents, generateRaceDecisions, updateStandings,
  updateConstructorStandings, buildRaceSession, calculateRaceXP,
  formatLapTime,
} from '../services/simulationEngine';
import { saveRaceResult, applyXPGain, updateLeaderboard, finishSeason } from '../services/gameService';
import { getCircuitByRound } from '../data/circuits2026';
import { RIDERS_2026 } from '../data/riders2026';
import { TEAMS_2026 } from '../data/teams2026';
import type { QualifyingResult, RaceResult, WeatherCondition } from '../types';
import type { RaceDecisionEvent } from '../services/simulationEngine';

type Phase = 'intro' | 'lights' | 'qualifying' | 'sprint_decision' | 'sprint' | 'race_decision' | 'race' | 'result';

export function RacePage() {
  const { character, season, setSeason, user } = useGameStore();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>('intro');
  const [weather, setWeather] = useState<WeatherCondition>('seco');
  const [qualifying, setQualifying] = useState<QualifyingResult[]>([]);
  const [sprintResults, setSprintResults] = useState<RaceResult[]>([]);
  const [raceResults, setRaceResults] = useState<RaceResult[]>([]);
  const [decisions, setDecisions] = useState<RaceDecisionEvent[]>([]);
  const [currentDecision, setCurrentDecision] = useState(0);
  const [decisionScore, setDecisionScore] = useState(0);
  const [sprintDecisions, setSprintDecisions] = useState<RaceDecisionEvent[]>([]);
  const [currentSprintDecision, setCurrentSprintDecision] = useState(0);
  const [sprintDecisionScore, setSprintDecisionScore] = useState(0);
  const [events, setEvents] = useState<{ message: string; lap: number }[]>([]);
  const [saving, setSaving] = useState(false);

  if (!character || !season) { navigate('/dashboard'); return null; }

  const circuit = getCircuitByRound(season.currentRound);
  if (!circuit) { navigate('/dashboard'); return null; }

  void TEAMS_2026;
  const hasSprint = circuit.hasSprint;

  function startRace() {
    const w = generateWeather(circuit!.weatherProbability);
    setWeather(w);

    const { finalGrid } = runQualifying(character!, circuit!, w, RIDERS_2026);
    setQualifying(finalGrid);

    // Generar decisiones
    const mainDecisions = generateRaceDecisions(circuit!, w, finalGrid.find(g => g.isPlayer)?.position ?? 10, circuit!.laps);
    setDecisions(mainDecisions);

    if (hasSprint) {
      const sd = generateRaceDecisions(circuit!, w, finalGrid.find(g => g.isPlayer)?.position ?? 10, Math.ceil(circuit!.laps / 2));
      setSprintDecisions(sd.slice(0, 3));
    }

    setPhase('qualifying');
  }

  function handleSprintDecision(posImpact: number) {
    setSprintDecisionScore(prev => prev + posImpact);
    if (currentSprintDecision < sprintDecisions.length - 1) {
      setCurrentSprintDecision(prev => prev + 1);
    } else {
      runSprint();
    }
  }

  function runSprint() {
    const sr = simulateRace(character!, qualifying, circuit!, weather, sprintDecisionScore, RIDERS_2026, true);
    setSprintResults(sr);
    setPhase('sprint');
  }

  function handleMainDecision(posImpact: number) {
    setDecisionScore(prev => prev + posImpact);
    if (currentDecision < decisions.length - 1) {
      setCurrentDecision(prev => prev + 1);
    } else {
      runMainRace();
    }
  }

  function runMainRace() {
    const results = simulateRace(character!, qualifying, circuit!, weather, decisionScore, RIDERS_2026, false);
    const playerResult = results.find(r => r.isPlayer)!;
    const evs = generateRaceEvents(circuit!, weather, playerResult, results, character!, false);
    setRaceResults(results);
    setEvents(evs.map(e => ({ message: e.message, lap: e.lap })));
    setPhase('race');
  }

  async function handleFinish() {
    if (saving) return;
    setSaving(true);
    try {
      const playerResult = raceResults.find(r => r.isPlayer) ?? raceResults[0];
      const sprintPlayerResult = sprintResults.find(r => r.isPlayer) ?? null;

      const raceSession = buildRaceSession(
        circuit!,
        qualifying,
        raceResults,
        events.map((e, i) => ({ lap: e.lap, type: 'start' as const, message: e.message, impact: 0, _idx: i })),
        weather,
        hasSprint ? qualifying : undefined,
        hasSprint ? sprintResults : undefined,
      );

      const newDriverStandings = updateStandings(
        season!.driverStandings,
        raceResults,
        qualifying,
        character!.id,
      );

      let standingsWithSprint = newDriverStandings;
      if (hasSprint && sprintResults.length > 0) {
        standingsWithSprint = updateStandings(newDriverStandings, sprintResults, qualifying, character!.id, true);
      }

      const newConstructors = updateConstructorStandings(
        season!.constructorStandings,
        raceResults,
        RIDERS_2026,
        character!.teamId,
      );

      const newRound = season!.currentRound + 1;
      const isSeasonOver = newRound > 22;

      await saveRaceResult(season!.id, raceSession, standingsWithSprint, newConstructors, newRound);

      const isChampionshipLead = standingsWithSprint[0]?.riderId === character!.id;
      const xpGained = calculateRaceXP(playerResult, sprintPlayerResult, isChampionshipLead);

      const { leveledUp, newLevel } = await applyXPGain(character!.id, xpGained);
      if (leveledUp) toast.success(`🎉 ¡Subiste al nivel ${newLevel}!`);

      // Update leaderboard
      if (user) {
        const totalWins = standingsWithSprint.find(s => s.riderId === character!.id)?.wins ?? 0;
        await updateLeaderboard({
          userId: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
          totalPoints: standingsWithSprint.find(s => s.riderId === character!.id)?.points ?? 0,
          totalWins,
          championships: user.stats?.bestChampionshipPosition === 1 ? 1 : 0,
          bestPosition: 1,
          updatedAt: Date.now(),
        });
      }

      if (isSeasonOver) {
        const finalPos = standingsWithSprint.findIndex(s => s.riderId === character!.id) + 1;
        await finishSeason(season!.id, finalPos);
      }

      setSeason({
        ...season!,
        completedRaces: [...season!.completedRaces, raceSession],
        driverStandings: standingsWithSprint,
        constructorStandings: newConstructors,
        currentRound: newRound,
        phase: isSeasonOver ? 'post_season' : (newRound <= 7 ? 'pre_season' : newRound <= 16 ? 'mid_season' : 'post_season'),
      });

      setPhase('result');
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar la carrera');
    } finally {
      setSaving(false);
    }
  }

  const playerQualy = qualifying.find(q => q.isPlayer);
  const playerRace = raceResults.find(r => r.isPlayer);
  const playerSprint = sprintResults.find(r => r.isPlayer);

  const weatherLabel: Record<WeatherCondition, string> = {
    seco: '☀️ Seco', humedo: '🌦️ Húmedo', mojado: '🌧️ Mojado', diluvio: '⛈️ Diluvio'
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* LUCES DE SALIDA */}
      {phase === 'lights' && <StartLights onComplete={hasSprint ? () => setPhase('sprint_decision') : () => setPhase('race_decision')} />}

      {/* INTRO */}
      {phase === 'intro' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card glow>
            <div className="text-center">
              <p className="text-4xl mb-2">{circuit.flagEmoji}</p>
              <h1 className="font-orbitron font-black text-2xl text-white mb-1">Ronda {season.currentRound}</h1>
              <p className="text-lg text-gray-300 mb-1">{circuit.name}</p>
              <p className="text-sm text-gray-500 mb-4">{circuit.city} · {circuit.laps} vueltas · {circuit.length} km</p>
              <div className="flex justify-center gap-4 text-sm mb-6">
                <span>🌧️ Lluvia: {circuit.weatherProbability}%</span>
                {hasSprint && <span className="text-orange-400">⚡ Hay Sprint</span>}
              </div>
              <button onClick={startRace} className="btn-primary px-8 py-3 text-lg">
                🚦 Comenzar Fin de Semana
              </button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* CLASIFICACIÓN */}
      {phase === 'qualifying' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-orbitron font-bold text-white">Clasificación</h2>
              <span className="text-sm text-gray-400">{weatherLabel[weather]}</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">Posición en parrilla de salida</p>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {qualifying.slice(0, 12).map(q => {
                const rider = RIDERS_2026.find(r => r.id === q.riderId);
                const isP = q.isPlayer ?? false;
                return (
                  <div key={q.riderId} className={`flex items-center gap-3 p-2 rounded-lg text-sm ${isP ? 'bg-motogp-red/20 border border-motogp-red/30' : 'bg-white/5'}`}>
                    <span className={`font-orbitron font-bold w-6 text-center ${q.position <= 3 ? 'text-yellow-400' : 'text-gray-400'}`}>{q.position}</span>
                    <span>{isP ? '🏍️' : (rider?.flagEmoji ?? '🏁')}</span>
                    <span className={`flex-1 ${isP ? 'text-motogp-red font-bold' : 'text-white'}`}>
                      {isP ? `${character.nombre} ${character.apellido}` : `${rider?.name ?? ''} ${rider?.surname ?? ''}`}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {q.position === 1 ? formatLapTime(q.lapTime) : `+${(q.gap / 1000).toFixed(3)}`}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 bg-motogp-red/10 rounded-lg">
              <p className="text-motogp-red text-sm font-bold">Tu posición: P{playerQualy?.position}</p>
              <p className="text-xs text-gray-400 mt-0.5">{playerQualy?.position === 1 ? '¡POLE POSITION!' : playerQualy?.position && playerQualy.position <= 3 ? 'Primera fila' : 'En la parrilla'}</p>
            </div>
            <button
              onClick={() => setPhase('lights')}
              className="btn-primary w-full mt-4"
            >
              {hasSprint ? '⚡ Ir al Sprint' : '🏁 A la carrera'}
            </button>
          </Card>
        </motion.div>
      )}

      {/* DECISIONES SPRINT */}
      {phase === 'sprint_decision' && sprintDecisions[currentSprintDecision] && (
        <DecisionPanel
          decision={sprintDecisions[currentSprintDecision]}
          current={currentSprintDecision}
          total={sprintDecisions.length}
          onChoose={handleSprintDecision}
          label="Sprint"
        />
      )}

      {/* RESULTADO SPRINT */}
      {phase === 'sprint' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card>
            <h2 className="font-orbitron font-bold text-white mb-4">Resultado Sprint</h2>
            <div className="space-y-1 max-h-60 overflow-y-auto mb-4">
              {sprintResults.slice(0, 9).map(r => {
                const rider = RIDERS_2026.find(rd => rd.id === r.riderId);
                const isP = r.isPlayer ?? false;
                return (
                  <div key={r.riderId} className={`flex items-center gap-2 p-2 rounded text-sm ${isP ? 'bg-motogp-red/20' : 'bg-white/5'}`}>
                    <span className="font-orbitron w-6 text-center text-gray-400">{r.dnf ? 'DNF' : r.finishPosition}</span>
                    <span>{isP ? '🏍️' : (rider?.flagEmoji ?? '🏁')}</span>
                    <span className={`flex-1 ${isP ? 'text-motogp-red font-bold' : 'text-white'}`}>
                      {isP ? `${character.apellido}` : `${rider?.surname ?? ''}`}
                    </span>
                    <span className="text-xs text-gray-400">{r.points} pts</span>
                  </div>
                );
              })}
            </div>
            <div className="p-3 bg-motogp-red/10 rounded-lg mb-4">
              <p className="text-motogp-red font-bold">Sprint: {playerSprint?.dnf ? 'DNF' : `P${playerSprint?.finishPosition}`}</p>
              <p className="text-xs text-gray-400">+{playerSprint?.points ?? 0} puntos</p>
            </div>
            <button onClick={() => setPhase('race_decision')} className="btn-primary w-full">
              🏁 Ir a la Carrera Principal
            </button>
          </Card>
        </motion.div>
      )}

      {/* DECISIONES CARRERA PRINCIPAL */}
      {phase === 'race_decision' && decisions[currentDecision] && (
        <DecisionPanel
          decision={decisions[currentDecision]}
          current={currentDecision}
          total={decisions.length}
          onChoose={handleMainDecision}
          label="Carrera"
        />
      )}

      {/* EVENTOS DE CARRERA */}
      {phase === 'race' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card>
            <h2 className="font-orbitron font-bold text-white mb-4">Carrera en Directo</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {events.map((e, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3 text-sm p-2 bg-white/5 rounded"
                >
                  <span className="text-gray-500 font-mono w-16 flex-shrink-0">V.{e.lap}</span>
                  <span className="text-gray-300">{e.message}</span>
                </motion.div>
              ))}
            </div>
            <div className="p-3 bg-motogp-red/10 rounded-lg mb-4">
              <p className="text-motogp-red font-bold">
                {playerRace?.dnf ? '💔 DNF' : `P${playerRace?.finishPosition}`}
              </p>
              <p className="text-xs text-gray-400">+{playerRace?.points ?? 0} puntos</p>
              {playerRace?.fastestLap && <p className="text-xs text-purple-400">⚡ Vuelta Rápida +1pt</p>}
            </div>
            <button onClick={handleFinish} disabled={saving} className="btn-primary w-full">
              {saving ? '⏳ Guardando...' : '✅ Confirmar Resultado'}
            </button>
          </Card>
        </motion.div>
      )}

      {/* RESULTADO FINAL */}
      {phase === 'result' && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card glow>
            <div className="text-center">
              <p className="text-5xl mb-3">
                {playerRace?.finishPosition === 1 ? '🏆' : playerRace?.finishPosition && playerRace.finishPosition <= 3 ? '🥉' : playerRace?.dnf ? '💔' : '🏁'}
              </p>
              <h2 className="font-orbitron font-black text-2xl text-white mb-1">
                {playerRace?.dnf ? 'DNF' : `P${playerRace?.finishPosition}`}
              </h2>
              <p className="text-gray-400 mb-1">{circuit.name}</p>
              {hasSprint && (
                <p className="text-xs text-orange-400 mb-2">Sprint: {playerSprint?.dnf ? 'DNF' : `P${playerSprint?.finishPosition}`} (+{playerSprint?.points ?? 0} pts)</p>
              )}
              <p className="text-xl font-bold text-white mb-4">+{playerRace?.points ?? 0} puntos</p>

              <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                {[
                  { label: 'Posición parrilla', value: `P${playerRace?.startPosition}` },
                  { label: 'Posición final', value: playerRace?.dnf ? 'DNF' : `P${playerRace?.finishPosition}` },
                  { label: 'Clima', value: weatherLabel[weather] },
                  { label: 'Ronda', value: `${season.currentRound > 22 ? 22 : season.currentRound - 1}/22` },
                ].map(i => (
                  <div key={i.label} className="bg-white/5 rounded p-2">
                    <p className="text-gray-500 text-xs">{i.label}</p>
                    <p className="text-white font-bold">{i.value}</p>
                  </div>
                ))}
              </div>

              <button onClick={() => navigate('/dashboard')} className="btn-primary w-full">
                Volver al Paddock →
              </button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function DecisionPanel({
  decision, current, total, onChoose, label,
}: {
  decision: RaceDecisionEvent;
  current: number;
  total: number;
  onChoose: (posImpact: number) => void;
  label: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-gray-500 font-orbitron">Decisión {current + 1}/{total} — {label}</span>
          <span className="text-xs text-gray-500">Vuelta {decision.lap}</span>
        </div>
        <p className="text-white font-medium mb-4 text-sm">{decision.situation}</p>
        <div className="space-y-2">
          {decision.options.map(opt => (
            <button
              key={opt.id}
              onClick={() => onChoose(opt.positionImpact)}
              className="w-full text-left p-3 rounded-xl border border-white/10 hover:border-motogp-red/50 hover:bg-motogp-red/5 transition-all"
            >
              <p className="text-white text-sm font-medium">{opt.text}</p>
              <p className="text-gray-500 text-xs mt-0.5">{opt.description}</p>
            </button>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
