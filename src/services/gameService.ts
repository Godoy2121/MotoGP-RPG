import {
  doc, getDoc, setDoc, updateDoc, collection,
  getDocs, query, orderBy, limit,
} from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { db } from './firebase';
import type {
  UserProfile, PlayerCharacter, CareerSeason,
  RaceSession, LeaderboardEntry, Achievement,
} from '../types';
import { CIRCUITS_2026 } from '../data/circuits2026';
import { RIDERS_2026 } from '../data/riders2026';

// ── User Profile ──────────────────────────────────────────────
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function createUserProfile(profile: UserProfile): Promise<void> {
  await setDoc(doc(db, 'users', profile.uid), profile);
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await updateDoc(doc(db, 'users', uid), data as any);
}

// ── Character ─────────────────────────────────────────────────
export async function saveCharacter(character: PlayerCharacter): Promise<void> {
  await setDoc(doc(db, 'characters', character.id), character);
}

export async function getCharacter(characterId: string): Promise<PlayerCharacter | null> {
  const snap = await getDoc(doc(db, 'characters', characterId));
  return snap.exists() ? (snap.data() as PlayerCharacter) : null;
}

export async function applyXPGain(
  characterId: string,
  xpGained: number
): Promise<{ newLevel: number; leveledUp: boolean; statPointsGained: number }> {
  const snap = await getDoc(doc(db, 'characters', characterId));
  if (!snap.exists()) return { newLevel: 1, leveledUp: false, statPointsGained: 0 };

  const char = snap.data() as PlayerCharacter;
  let { xp, level, statPoints } = char;
  xp += xpGained;
  let leveledUp = false;
  let statPointsGained = 0;

  while (xp >= xpForNextLevel(level)) {
    xp -= xpForNextLevel(level);
    level++;
    statPoints += 2;
    statPointsGained += 2;
    leveledUp = true;
  }

  await updateDoc(doc(db, 'characters', characterId), {
    xp,
    level,
    xpToNextLevel: xpForNextLevel(level),
    statPoints,
  });

  return { newLevel: level, leveledUp, statPointsGained };
}

export function xpForNextLevel(level: number): number {
  return Math.floor(300 * Math.pow(level, 1.5));
}

// ── Season ────────────────────────────────────────────────────
export async function createSeason(season: CareerSeason): Promise<void> {
  await setDoc(doc(db, 'seasons', season.id), season);
}

export async function getSeason(seasonId: string): Promise<CareerSeason | null> {
  const snap = await getDoc(doc(db, 'seasons', seasonId));
  return snap.exists() ? (snap.data() as CareerSeason) : null;
}

export async function saveRaceResult(
  seasonId: string,
  raceSession: RaceSession,
  newStandings: CareerSeason['driverStandings'],
  newConstructors: CareerSeason['constructorStandings'],
  newRound: number,
): Promise<void> {
  const ref = doc(db, 'seasons', seasonId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const season = snap.data() as CareerSeason;
  const completedRaces = [...season.completedRaces, raceSession];
  const phase: CareerSeason['phase'] =
    newRound <= 7 ? 'pre_season' :
    newRound <= 16 ? 'mid_season' : 'post_season';

  await updateDoc(ref, {
    completedRaces,
    driverStandings: newStandings,
    constructorStandings: newConstructors,
    currentRound: newRound,
    phase,
  });
}

export async function finishSeason(
  seasonId: string,
  finalPosition: number,
): Promise<void> {
  await updateDoc(doc(db, 'seasons', seasonId), {
    phase: 'post_season',
    finalPosition,
    finishedAt: Date.now(),
  });
}

export async function startNewSeason(
  character: PlayerCharacter,
  currentSeason: CareerSeason,
  newTeamId: string,
  newReplacedRiderId: string,
): Promise<CareerSeason> {
  const newSeasonId = nanoid();

  const allRiders = RIDERS_2026.map(r => ({
    riderId: r.id,
    points: 0, wins: 0, podiums: 0, poles: 0, fastestLaps: 0, dnfs: 0, sprintWins: 0,
  }));

  const manufacturers = ['Ducati', 'Aprilia', 'KTM', 'Yamaha', 'Honda'] as const;
  const constructors = manufacturers.map(m => ({
    manufacturer: m,
    teamId: m.toLowerCase(),
    points: 0,
    wins: 0,
  }));

  const newSeason: CareerSeason = {
    id: newSeasonId,
    userId: currentSeason.userId,
    characterId: character.id,
    season: currentSeason.season + 1,
    teamId: newTeamId,
    currentRound: 1,
    completedRaces: [],
    driverStandings: allRiders,
    constructorStandings: constructors,
    phase: 'pre_season',
    startedAt: Date.now(),
    claimedObjectiveIds: [],
  };

  await createSeason(newSeason);
  await updateDoc(doc(db, 'characters', character.id), {
    teamId: newTeamId,
    replacedRiderId: newReplacedRiderId,
  });
  await updateDoc(doc(db, 'users', character.userId), {
    activeSeasonId: newSeasonId,
  });

  return newSeason;
}

// ── Achievements & Objectives ─────────────────────────────────
export async function unlockAchievement(
  uid: string,
  achievement: Achievement,
): Promise<void> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return;
  const user = snap.data() as UserProfile;
  if (user.achievements.includes(achievement.id)) return;

  await updateDoc(doc(db, 'users', uid), {
    achievements: [...user.achievements, achievement.id],
    totalXp: user.totalXp + achievement.xpReward,
  });
}

export async function claimObjectiveReward(
  seasonId: string,
  characterId: string,
  objectiveId: string,
  reward: { xp: number; statPoints: number },
): Promise<void> {
  await updateDoc(doc(db, 'seasons', seasonId), {
    claimedObjectiveIds: [objectiveId],
  });
  const snap = await getDoc(doc(db, 'characters', characterId));
  if (!snap.exists()) return;
  const char = snap.data() as PlayerCharacter;
  await updateDoc(doc(db, 'characters', characterId), {
    xp: char.xp + reward.xp,
    statPoints: char.statPoints + reward.statPoints,
  });
}

// ── Leaderboard ───────────────────────────────────────────────
export async function updateLeaderboard(entry: LeaderboardEntry): Promise<void> {
  await setDoc(doc(db, 'leaderboard', entry.userId), entry);
}

export async function getLeaderboard(top = 50): Promise<LeaderboardEntry[]> {
  const q = query(
    collection(db, 'leaderboard'),
    orderBy('totalPoints', 'desc'),
    limit(top),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as LeaderboardEntry);
}

// ── Helpers ───────────────────────────────────────────────────
export function buildInitialStandings(): CareerSeason['driverStandings'] {
  return RIDERS_2026.map(r => ({
    riderId: r.id,
    points: 0, wins: 0, podiums: 0, poles: 0, fastestLaps: 0, dnfs: 0, sprintWins: 0,
  }));
}

export function buildInitialConstructors(): CareerSeason['constructorStandings'] {
  const manufacturers = ['Ducati', 'Aprilia', 'KTM', 'Yamaha', 'Honda'] as const;
  return manufacturers.map(m => ({ manufacturer: m, teamId: m.toLowerCase(), points: 0, wins: 0 }));
}

export function getNextCircuit(currentRound: number) {
  return CIRCUITS_2026.find(c => c.round === currentRound);
}
