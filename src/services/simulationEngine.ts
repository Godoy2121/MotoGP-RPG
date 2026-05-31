import type {
  RiderStats, Circuit, WeatherCondition,
  QualifyingResult, RaceResult, RaceEvent, RaceSession,
  PlayerCharacter, CareerSeason, Rider,
} from '../types';
import { TEAMS_2026 } from '../data/teams2026';

// ── Puntos MotoGP ─────────────────────────────────────────────
export const RACE_POINTS = [25, 20, 16, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
export const SPRINT_POINTS = [12, 9, 7, 6, 5, 4, 3, 2, 1];
export const FASTEST_LAP_BONUS = 1;

// ── Utilidades matemáticas ────────────────────────────────────
function gaussianRand(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Puntuación del piloto ─────────────────────────────────────
function riderScore(
  stats: RiderStats,
  bikePerformance: number,
  weather: WeatherCondition,
  noise: number = 0.08,
): number {
  const wetFactor =
    weather === 'seco' ? 1
    : weather === 'humedo' ? 0.5 + (stats.tiempoMojado / 100) * 0.5
    : weather === 'mojado' ? stats.tiempoMojado / 100
    : (stats.tiempoMojado / 100) * 0.85;

  const base = (
    stats.velocidad * 0.30 +
    stats.frenada * 0.18 +
    stats.pasoCurva * 0.22 +
    stats.aceleracion * 0.12 +
    stats.tiempoMojado * 0.08 +
    stats.gestionNeumaticos * 0.10
  ) * wetFactor * 0.55 + bikePerformance * 0.45;

  return clamp(base + gaussianRand() * base * noise, 10, 120);
}

// ── Tiempo de vuelta (ms) ─────────────────────────────────────
function lapTime(score: number, circuit: Circuit): number {
  const base = (circuit.length / score) * 220000;
  return Math.round(base + (Math.random() - 0.5) * 500);
}

function formatLapTime(ms: number): string {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${min}:${sec.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
}

// ── Condición climática ───────────────────────────────────────
export function generateWeather(weatherProbability: number): WeatherCondition {
  const roll = Math.random() * 100;
  if (roll > weatherProbability) return 'seco';
  if (roll > weatherProbability * 0.5) return 'humedo';
  if (roll > weatherProbability * 0.2) return 'mojado';
  return 'diluvio';
}

// ── Clasificación (Q1/Q2) ─────────────────────────────────────
export interface QualifyingSession {
  q1Results: QualifyingResult[];
  q2Results: QualifyingResult[];
  finalGrid: QualifyingResult[];
}

export function runQualifying(
  character: PlayerCharacter,
  circuit: Circuit,
  weather: WeatherCondition,
  allRiders: Rider[],
): QualifyingSession {
  const teams = Object.fromEntries(TEAMS_2026.map(t => [t.id, t]));

  // Marca al jugador en la lista de riders
  const ridersWithPlayer = allRiders.map(r => ({
    ...r,
    isPlayer: r.id === character.replacedRiderId,
  }));

  // Práctica combinada: determina top-10 directos a Q2
  const practiceScores = ridersWithPlayer.map(r => {
    const team = teams[r.teamId];
    const stats = r.isPlayer ? character.stats : r.stats;
    const score = riderScore(stats, team?.bikePerformance ?? 80, weather, 0.06);
    return { rider: r, score, isPlayer: r.isPlayer };
  });
  practiceScores.sort((a, b) => b.score - a.score);

  const directQ2 = practiceScores.slice(0, 10);
  const q1Riders = practiceScores.slice(10);

  // Q1: Los últimos 12, top-2 avanzan a Q2
  const q1Sorted = q1Riders.map((ps) => {
    const team = teams[ps.rider.teamId];
    const stats = ps.rider.isPlayer ? character.stats : ps.rider.stats;
    const score = riderScore(stats, team?.bikePerformance ?? 80, weather, 0.07);
    const lt = lapTime(score, circuit);
    return {
      riderId: ps.rider.isPlayer ? 'player' : ps.rider.id,
      position: 0,
      lapTime: lt,
      gap: 0,
      isPlayer: ps.rider.isPlayer,
    };
  }).sort((a, b) => a.lapTime - b.lapTime);

  const q1Best = q1Sorted[0]?.lapTime ?? 0;
  const q1Results: QualifyingResult[] = q1Sorted.map((r, i) => ({
    ...r,
    position: i + 1,
    gap: r.lapTime - q1Best,
  }));

  const q1Promoted = q1Results.slice(0, 2);

  // Q2: top-10 de práctica + 2 de Q1 = 12 pilotos
  const q2Riders = [...directQ2, ...q1Promoted.map(p => ({
    rider: ridersWithPlayer.find(r => (p.isPlayer ? r.isPlayer : r.id === p.riderId))!,
    score: 0,
    isPlayer: p.isPlayer ?? false,
  }))];

  const q2Results: QualifyingResult[] = q2Riders.map(ps => {
    const team = teams[ps.rider?.teamId ?? ''];
    const stats = ps.isPlayer ? character.stats : ps.rider?.stats ?? character.stats;
    const score = riderScore(stats, team?.bikePerformance ?? 80, weather, 0.07);
    const lt = lapTime(score, circuit);
    return {
      riderId: ps.isPlayer ? 'player' : (ps.rider?.id ?? ''),
      position: 1,
      lapTime: lt,
      gap: 0,
      isPlayer: ps.isPlayer,
    };
  }).sort((a, b) => a.lapTime - b.lapTime);

  const q2Best = q2Results[0]?.lapTime ?? 0;
  q2Results.forEach((r, i) => { r.position = i + 1; r.gap = r.lapTime - q2Best; });

  // Grid final: Q2 (P1-P12) + Q1 eliminados (P13-P22)
  const q1Eliminated = q1Results.slice(2);
  const finalGrid: QualifyingResult[] = [
    ...q2Results,
    ...q1Eliminated.map((r, i) => ({ ...r, position: 13 + i })),
  ];

  return { q1Results, q2Results, finalGrid };
}

// ── Simulación de carrera ─────────────────────────────────────
export function simulateRace(
  character: PlayerCharacter,
  gridPositions: QualifyingResult[],
  _circuit: Circuit,
  weather: WeatherCondition,
  playerDecisionScore: number,
  allRiders: Rider[],
  isSprint = false,
): RaceResult[] {
  const riderMap = Object.fromEntries(allRiders.map(r => [r.id, r]));

  const gridBonus = isSprint ? 0.15 : 0.25;
  const maxGrid = gridPositions.length;

  const scored = gridPositions.map(gp => {
    const isPlayer = gp.isPlayer ?? gp.riderId === 'player';
    const rider = isPlayer ? null : riderMap[gp.riderId];
    const team = isPlayer
      ? TEAMS_2026.find(t => t.id === character.teamId)
      : TEAMS_2026.find(t => t.id === rider?.teamId);

    const stats = isPlayer ? character.stats : (rider?.stats ?? character.stats);
    const bikePerf = team?.bikePerformance ?? 80;

    const gridMult = 1 + (gridBonus * (maxGrid - gp.position) / maxGrid);
    let score = riderScore(stats, bikePerf, weather) * gridMult;

    if (isPlayer) {
      score += playerDecisionScore * 2.5;
    }

    // Probabilidad de caída: MotoGP tiene más crashes
    const crashProb = isPlayer ? 0.03 : (team ? (100 - team.reliability) / 500 : 0.04);
    const dnf = Math.random() < crashProb;

    return { riderId: isPlayer ? 'player' : gp.riderId, score, dnf, isPlayer, gridPos: gp.position };
  });

  scored.sort((a, b) => (a.dnf ? 1 : 0) - (b.dnf ? 1 : 0) || b.score - a.score);

  const pointsTable = isSprint ? SPRINT_POINTS : RACE_POINTS;

  // Vuelta rápida: solo pilotos en Top 15 no-sprint
  let fastestLapIdx = -1;
  if (!isSprint) {
    const top15Finishers = scored.filter((_, i) => i < 15 && !scored[i].dnf);
    if (top15Finishers.length > 0) {
      fastestLapIdx = scored.indexOf(pick(top15Finishers));
    }
  }

  return scored.map((s, i) => {
    const pos = i + 1;
    let pts = s.dnf ? 0 : (pointsTable[pos - 1] ?? 0);
    const hasFastest = i === fastestLapIdx;
    if (hasFastest && pos <= 15) pts += FASTEST_LAP_BONUS;

    return {
      riderId: s.riderId,
      startPosition: s.gridPos,
      finishPosition: s.dnf ? 99 : pos,
      points: pts,
      dnf: s.dnf,
      fastestLap: hasFastest,
      isPlayer: s.isPlayer,
    };
  });
}

// ── Eventos de carrera (narrativa) ───────────────────────────
export function generateRaceEvents(
  circuit: Circuit,
  weather: WeatherCondition,
  playerResult: RaceResult,
  _allResults: RaceResult[],
  character: PlayerCharacter,
  isSprint = false,
): RaceEvent[] {
  const events: RaceEvent[] = [];
  const totalLaps = isSprint ? Math.ceil(circuit.laps / 2) : circuit.laps;
  const playerPos = playerResult.finishPosition === 99 ? '??' : `P${playerResult.finishPosition}`;
  const apellido = character.apellido;

  // Salida
  const startMessages = [
    `¡Luces apagadas! ${apellido} sale desde ${playerResult.startPosition === 1 ? 'la pole' : `P${playerResult.startPosition}`}`,
    `🚦 ¡Se apagan las luces! ${apellido} arranca fuerte en vuelta 1`,
    `¡La carrera ha comenzado! ${apellido} sale en P${playerResult.startPosition}`,
  ];
  events.push({ lap: 1, type: 'start', message: pick(startMessages) });

  // Incidente en vuelta 1
  if (Math.random() < 0.4) {
    events.push({ lap: 1, type: 'safety_car', message: '⚠️ Incidente en la primera curva — se despliega la bandera amarilla' });
  }

  // Batallas rueda a rueda
  if (!playerResult.dnf && playerResult.finishPosition <= 10) {
    const battleLap = randomInt(3, Math.floor(totalLaps * 0.4));
    const battles = [
      `💥 ¡Mano a mano! ${apellido} defiende la posición bajo presión`,
      `🔥 Batalla épica: ${apellido} intenta el adelantamiento en la frenada`,
      `⚡ ${apellido} pasa al piloto de delante al límite del límite`,
    ];
    events.push({ lap: battleLap, type: 'overtake', message: pick(battles) });
  }

  // Safety Car
  if (!isSprint && Math.random() < 0.3) {
    const scLap = randomInt(Math.floor(totalLaps * 0.2), Math.floor(totalLaps * 0.6));
    events.push({ lap: scLap, type: 'safety_car', message: '🔶 Safety Car en pista — accidente de dos pilotos en la chicane' });
  }

  // Lluvia / Flag-to-Flag
  if (weather !== 'seco' && !isSprint) {
    const rainLap = randomInt(Math.floor(totalLaps * 0.25), Math.floor(totalLaps * 0.55));
    if (weather === 'diluvio') {
      events.push({ lap: rainLap, type: 'flag_to_flag', message: '🔴 ¡Carrera interrumpida! Bandera roja por lluvia torrencial — se reiniciará' });
    } else {
      events.push({ lap: rainLap, type: 'rain', message: `🌧️ Comienza a llover — pista ${weather === 'mojado' ? 'mojada' : 'húmeda'}` });
    }
  }

  // Parada en boxes (carrera)
  if (!isSprint) {
    const pitLap = randomInt(Math.floor(totalLaps * 0.3), Math.floor(totalLaps * 0.55));
    events.push({ lap: pitLap, type: 'pit', message: `🔧 ${apellido} entra en boxes — cambio de neumáticos` });
  }

  // DNF del jugador
  if (playerResult.dnf) {
    const dnfLap = randomInt(3, totalLaps - 3);
    const dnfMessages = [
      `💔 ¡Caída de ${apellido}! Se va al suelo en la curva ${randomInt(1, 12)} — carrera terminada`,
      `🔴 ${apellido} abandona — problema técnico en la moto`,
      `⛑️ ${apellido} al suelo — afortunadamente está bien`,
    ];
    events.push({ lap: dnfLap, type: 'dnf', message: pick(dnfMessages) });
  }

  // Vuelta rápida
  if (playerResult.fastestLap) {
    const flLap = randomInt(Math.floor(totalLaps * 0.6), totalLaps - 2);
    events.push({ lap: flLap, type: 'fastest_lap', message: `⚡ ¡VUELTA RÁPIDA! ${apellido} marca el tiempo más rápido de la carrera (+1 punto)` });
  }

  // Final de carrera
  if (!playerResult.dnf) {
    const finishMessages: Record<string, string> = {
      '1': `🏆 ¡VICTORIA! ¡${apellido} gana el Gran Premio! ¡Increíble!`,
      '2': `🥈 ¡Segundo puesto! Gran resultado para ${apellido}`,
      '3': `🥉 ¡Tercer lugar! Podio para ${apellido}`,
    };
    const msg = finishMessages[playerResult.finishPosition.toString()]
      ?? `🏁 ${apellido} termina en ${playerPos} — ${playerResult.points} puntos`;
    events.push({ lap: totalLaps, type: 'start', message: msg });
  }

  return events.sort((a, b) => a.lap - b.lap);
}

// ── Decisiones interactivas de carrera ───────────────────────
export interface RaceDecisionOption {
  id: string;
  text: string;
  description: string;
  positionImpact: number;
}

export interface RaceDecisionEvent {
  id: string;
  lap: number;
  situation: string;
  options: RaceDecisionOption[];
}

export function generateRaceDecisions(
  _circuit: Circuit,
  weather: WeatherCondition,
  playerGridPos: number,
  totalLaps: number,
): RaceDecisionEvent[] {
  const decisions: RaceDecisionEvent[] = [];

  // Decisión 1: Safety Car
  decisions.push({
    id: 'safety_car_call',
    lap: randomInt(Math.floor(totalLaps * 0.2), Math.floor(totalLaps * 0.4)),
    situation: '🔶 Safety Car en pista — ventana de boxes abierta. ¿Cuál es tu estrategia?',
    options: [
      { id: 'pit_now', text: 'Entrar en boxes ahora', description: 'Neumáticos frescos, perderás tiempo por el pitlane', positionImpact: 1 },
      { id: 'stay_out', text: 'Seguir en pista', description: 'Conservas la posición pero con neumáticos usados', positionImpact: 0 },
      { id: 'aggressive', text: 'Pits + Neumático Blando', description: 'Máximo ataque al reinicio — alto riesgo, alto premio', positionImpact: -1 },
    ],
  });

  // Decisión 2: Neumáticos críticos
  decisions.push({
    id: 'tire_critical',
    lap: randomInt(Math.floor(totalLaps * 0.55), Math.floor(totalLaps * 0.75)),
    situation: '⚠️ El trasero está muy degradado — neumático al límite. ¿Cómo gestionas?',
    options: [
      { id: 'manage_pace', text: 'Gestionar el ritmo', description: 'Conservas el neumático, el ritmo baja ligeramente', positionImpact: 0 },
      { id: 'push', text: 'Seguir al máximo', description: 'Arriesgas una caída, pero puedes ganar tiempo', positionImpact: -1 },
      { id: 'pit_fresh', text: 'Boxes urgente', description: 'Neumático nuevo pero pierdes posiciones por el tiempo en boxes', positionImpact: 1 },
    ],
  });

  // Decisión 3: Lluvia / Flag-to-Flag (solo si hay humedad)
  if (weather !== 'seco') {
    decisions.push({
      id: 'rain_decision',
      lap: randomInt(Math.floor(totalLaps * 0.25), Math.floor(totalLaps * 0.45)),
      situation: `🌧️ La pista está ${weather === 'diluvio' ? 'empapada' : weather}. ¿Cambias a neumáticos de lluvia?`,
      options: [
        { id: 'rain_tires', text: 'Boxes para lluvia', description: 'Correcto si llueve — pierdes tiempo en el pitlane', positionImpact: weather === 'mojado' ? 2 : -1 },
        { id: 'slick_risk', text: 'Seguir con slicks', description: 'Arriesgado con lluvia, pero correcto si para pronto', positionImpact: weather === 'humedo' ? 1 : -2 },
        { id: 'wait_see', text: 'Esperar instrucciones', description: 'Tu equipo te guía — decisión conservadora', positionImpact: 0 },
      ],
    });
  }

  // Decisión 4: Duelo rueda a rueda
  if (playerGridPos > 3) {
    decisions.push({
      id: 'wheel_to_wheel',
      lap: randomInt(Math.floor(totalLaps * 0.35), Math.floor(totalLaps * 0.6)),
      situation: '🏍️ El piloto de delante comete un error — hay hueco para atacar. ¿Cuándo actúas?',
      options: [
        { id: 'attack_now', text: 'Atacar en la frenada', description: 'Maniobra agresiva al límite del reglamento', positionImpact: 1 },
        { id: 'wait_better', text: 'Esperar mejor momento', description: 'Sigues su rebufo y atacas cuando el circuito ayude', positionImpact: 0 },
        { id: 'undercut', text: 'Undercut en boxes', description: 'Le adelantas estratégicamente en el pitlane', positionImpact: 1 },
      ],
    });
  }

  // Decisión 5: Últimas vueltas
  decisions.push({
    id: 'final_laps',
    lap: totalLaps - randomInt(3, 8),
    situation: `🏁 Faltan ${randomInt(3, 8)} vueltas. Estás en ${playerGridPos <= 10 ? 'zona de puntos' : 'la zona media'}. ¿Cómo afrontas el final?`,
    options: [
      { id: 'push_mode', text: 'Modo ataque total', description: 'Al límite con el neumático al borde — riesgo de caída', positionImpact: -1 },
      { id: 'steady_pace', text: 'Ritmo constante', description: 'Llevas la carrera a casa con margen de seguridad', positionImpact: 0 },
      { id: 'fastest_lap', text: 'Ir a vuelta rápida', description: 'Buscas el punto extra por vuelta rápida en el top 15', positionImpact: 0 },
    ],
  });

  return decisions.sort((a, b) => a.lap - b.lap);
}

// ── Actualización de clasificaciones ─────────────────────────
export function updateStandings(
  currentStandings: CareerSeason['driverStandings'],
  raceResults: RaceResult[],
  qualyResults: QualifyingResult[],
  characterId: string,
  isSprint = false,
): CareerSeason['driverStandings'] {
  const updated = currentStandings.map(s => ({ ...s }));

  for (const result of raceResults) {
    const riderId = result.isPlayer ? characterId : result.riderId;
    const standing = updated.find(s => s.riderId === riderId);
    if (!standing) continue;

    standing.points += result.points;
    if (!result.dnf) {
      if (result.finishPosition === 1) {
        if (isSprint) standing.sprintWins++;
        else standing.wins++;
      }
      if (!isSprint && result.finishPosition <= 3) standing.podiums++;
      if (result.fastestLap) standing.fastestLaps++;
    } else {
      standing.dnfs++;
    }
  }

  // Poles — solo carrera principal
  if (!isSprint) {
    const pole = qualyResults.find(q => q.position === 1);
    if (pole) {
      const riderId = pole.isPlayer ? characterId : pole.riderId;
      const standing = updated.find(s => s.riderId === riderId);
      if (standing) standing.poles++;
    }
  }

  return updated.sort((a, b) => b.points - a.points);
}

export function updateConstructorStandings(
  currentConstructors: CareerSeason['constructorStandings'],
  raceResults: RaceResult[],
  allRiders: Rider[],
  teamId: string,
): CareerSeason['constructorStandings'] {
  const updated = currentConstructors.map(c => ({ ...c }));
  const teamMap = Object.fromEntries(TEAMS_2026.map(t => [t.id, t]));
  const riderMap = Object.fromEntries(allRiders.map(r => [r.id, r]));

  for (const result of raceResults) {
    const riderTeamId = result.isPlayer ? teamId : (riderMap[result.riderId]?.teamId ?? '');
    const riderTeam = teamMap[riderTeamId];
    if (!riderTeam) continue;

    const constructorStanding = updated.find(c => c.manufacturer === riderTeam.manufacturer);
    if (!constructorStanding) continue;

    constructorStanding.points += result.points;
    if (!result.dnf && result.finishPosition === 1) constructorStanding.wins++;
  }

  return updated.sort((a, b) => b.points - a.points);
}

// ── Sesión completa ───────────────────────────────────────────
export function buildRaceSession(
  circuit: Circuit,
  qualifying: QualifyingResult[],
  race: RaceResult[],
  events: RaceEvent[],
  weather: WeatherCondition,
  sprintQualifying?: QualifyingResult[],
  sprintRace?: RaceResult[],
): Omit<RaceSession, 'playerResult' | 'sprintPlayerResult'> & { playerResult: RaceResult | null; sprintPlayerResult: RaceResult | null } {
  return {
    circuitId: circuit.id,
    round: circuit.round,
    season: 2026,
    weather,
    qualifying,
    race,
    events,
    playerResult: race.find(r => r.isPlayer) ?? null,
    completedAt: Date.now(),
    sprintQualifying,
    sprintRace,
    sprintPlayerResult: sprintRace?.find(r => r.isPlayer) ?? null,
  };
}

// ── Cálculo XP post-carrera ───────────────────────────────────
export function calculateRaceXP(
  result: RaceResult,
  sprintResult: RaceResult | null,
  isChampionshipLead: boolean,
): number {
  let xp = 100; // base por participar
  if (!result.dnf) {
    xp += (22 - result.finishPosition) * 15;
    xp += result.points * 8;
    if (result.finishPosition === 1) xp += 300;
    else if (result.finishPosition <= 3) xp += 150;
    else if (result.finishPosition <= 10) xp += 75;
    if (result.fastestLap) xp += 100;
  }

  if (sprintResult && !sprintResult.dnf) {
    xp += (22 - sprintResult.finishPosition) * 8;
    xp += sprintResult.points * 5;
    if (sprintResult.finishPosition === 1) xp += 150;
  }

  if (isChampionshipLead) xp += 100;

  return xp;
}

export { formatLapTime };
