export type WeatherCondition = 'seco' | 'humedo' | 'mojado' | 'diluvio';
export type TeamTier = 'elite' | 'strong' | 'midfield' | 'backmarker';
export type Manufacturer = 'Ducati' | 'Aprilia' | 'KTM' | 'Yamaha' | 'Honda';
export type AchievementRarity = 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
export type SeasonPhase = 'pre_season' | 'mid_season' | 'post_season';

export interface RiderStats {
  velocidad: number;        // Raw pace / qualifying
  frenada: number;          // Late braking / attack
  pasoCurva: number;        // Cornering / mid-corner
  aceleracion: number;      // Traction / exit speed
  tiempoMojado: number;     // Wet weather
  gestionNeumaticos: number;// Tire management
}

export interface AvatarStyle {
  cascoColor: string;
  cascoAccent: string;
  monoCuerpo: string;
  monoAccent: string;
}

export interface PlayerCharacter {
  id: string;
  userId: string;
  nombre: string;
  apellido: string;
  nacionalidad: string;
  numero: number;
  stats: RiderStats;
  level: number;
  xp: number;
  xpToNextLevel: number;
  statPoints: number;
  teamId: string;
  replacedRiderId: string;
  avatarStyle: AvatarStyle;
  upgrades: string[];
  createdAt: number;
}

export interface MotoGPTeam {
  id: string;
  name: string;
  shortName: string;
  manufacturer: Manufacturer;
  tier: TeamTier;
  color: string;
  accentColor: string;
  bikePerformance: number;  // 70-96
  reliability: number;       // 70-95 (higher = more reliable)
  logoUrl: string;
}

export interface Rider {
  id: string;
  name: string;
  surname: string;
  nationality: string;
  flagEmoji: string;
  number: number;
  teamId: string;
  stats: RiderStats;
  overallRating: number;
}

export interface Circuit {
  id: string;
  name: string;
  country: string;
  city: string;
  flagEmoji: string;
  laps: number;
  length: number;           // km
  hasSprint: boolean;
  overtakingDifficulty: number;   // 20-95 (higher = harder)
  weatherProbability: number;     // 0-100%
  round: number;
  raceDate: string;
}

export interface QualifyingResult {
  riderId: string;
  position: number;
  lapTime: number;         // ms
  gap: number;             // ms from leader
  isPlayer?: boolean;
}

export interface RaceResult {
  riderId: string;
  startPosition: number;
  finishPosition: number;
  points: number;
  dnf: boolean;
  dnfLap?: number;
  fastestLap?: boolean;
  isPlayer?: boolean;
}

export interface RaceEvent {
  lap: number;
  type: 'start' | 'pit' | 'dnf' | 'safety_car' | 'rain' | 'overtake' | 'defend' | 'fastest_lap' | 'decision' | 'flag_to_flag';
  message: string;
  impact?: number;
}

export interface RaceDecision {
  id: string;
  situation: string;
  options: {
    id: string;
    text: string;
    statRequired?: keyof RiderStats;
    positionImpact: number;
    description: string;
  }[];
}

export interface RaceSession {
  circuitId: string;
  round: number;
  season: number;
  weather: WeatherCondition;
  qualifying: QualifyingResult[];
  race: RaceResult[];
  events: RaceEvent[];
  playerResult: RaceResult | null;
  completedAt: number;
  sprintQualifying?: QualifyingResult[];
  sprintRace?: RaceResult[];
  sprintPlayerResult?: RaceResult | null;
}

export interface SeasonStanding {
  riderId: string;
  points: number;
  wins: number;
  podiums: number;
  poles: number;
  fastestLaps: number;
  dnfs: number;
  sprintWins: number;
}

export interface ConstructorStanding {
  manufacturer: Manufacturer;
  teamId: string;
  points: number;
  wins: number;
}

export interface CareerSeason {
  id: string;
  userId: string;
  characterId: string;
  season: number;
  teamId: string;
  currentRound: number;
  completedRaces: RaceSession[];
  driverStandings: SeasonStanding[];
  constructorStandings: ConstructorStanding[];
  phase: SeasonPhase;
  startedAt: number;
  finishedAt?: number;
  finalPosition?: number;
  claimedObjectiveIds: string[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  totalXp: number;
  achievements: string[];
  activeSeasonId?: string;
  activeCharacterId?: string;
  createdAt: number;
  stats: {
    totalRaces: number;
    totalWins: number;
    totalPodiums: number;
    totalPoles: number;
    bestChampionshipPosition: number;
    seasonsCompleted: number;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  xpReward: number;
  condition: {
    type: 'wins' | 'podiums' | 'poles' | 'points' | 'position' | 'streak' | 'special';
    value: number;
    extra?: Record<string, unknown>;
  };
}

export interface Objective {
  id: string;
  name: string;
  description: string;
  tierTarget: TeamTier[];
  condition: {
    type: string;
    value: number;
  };
  reward: {
    xp: number;
    statPoints: number;
  };
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  category: 'pilotaje' | 'estrategia' | 'mental' | 'fisico';
  xpCost: number;
  levelRequired: number;
  statRequired?: { stat: keyof RiderStats; value: number };
  statBonus: Partial<RiderStats>;
  prerequisiteId?: string;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL?: string;
  totalPoints: number;
  totalWins: number;
  championships: number;
  bestPosition: number;
  updatedAt: number;
}

export interface GameState {
  user: UserProfile | null;
  character: PlayerCharacter | null;
  season: CareerSeason | null;
  activeRace: RaceSession | null;
  leaderboard: LeaderboardEntry[];
  setUser: (u: UserProfile | null) => void;
  setCharacter: (c: PlayerCharacter | null) => void;
  setSeason: (s: CareerSeason | null) => void;
  setActiveRace: (r: RaceSession | null) => void;
  setLeaderboard: (l: LeaderboardEntry[]) => void;
  resetGame: () => void;
}
