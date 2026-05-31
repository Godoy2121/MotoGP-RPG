import type { Objective } from '../types';

export const OBJECTIVES: Objective[] = [
  // Backmarker objectives
  { id: 'bk_finish_races', name: 'Superviviente', description: 'Termina 10 carreras sin DNF', tierTarget: ['backmarker'], condition: { type: 'races_finished', value: 10 }, reward: { xp: 500, statPoints: 1 } },
  { id: 'bk_score_points', name: 'Puntuador Sorpresa', description: 'Consigue al menos 1 punto en una carrera', tierTarget: ['backmarker'], condition: { type: 'min_points_race', value: 1 }, reward: { xp: 800, statPoints: 2 } },
  { id: 'bk_beat_teammate', name: 'Duelo en el Paddock', description: 'Supera a tu compañero en 8 carreras', tierTarget: ['backmarker'], condition: { type: 'beat_teammate', value: 8 }, reward: { xp: 600, statPoints: 1 } },
  { id: 'bk_top15', name: 'Zona de Puntos', description: 'Termina en el Top 15 en 5 carreras', tierTarget: ['backmarker'], condition: { type: 'top_15', value: 5 }, reward: { xp: 700, statPoints: 2 } },
  { id: 'bk_points_season', name: 'Rookie del Año', description: 'Consigue 30 puntos en la temporada', tierTarget: ['backmarker'], condition: { type: 'season_points', value: 30 }, reward: { xp: 1000, statPoints: 2 } },

  // Midfield objectives
  { id: 'mid_podium', name: 'Sorpresa del Año', description: 'Sube al podio con un equipo midfield', tierTarget: ['midfield'], condition: { type: 'podiums', value: 1 }, reward: { xp: 1200, statPoints: 2 } },
  { id: 'mid_top10_season', name: 'Piloto Consistente', description: 'Termina en el Top 10 en 12 carreras', tierTarget: ['midfield'], condition: { type: 'top_10', value: 12 }, reward: { xp: 900, statPoints: 2 } },
  { id: 'mid_beat_factory', name: 'Caza-Fábricas', description: 'Supera a un piloto de equipo Elite 5 veces', tierTarget: ['midfield'], condition: { type: 'beat_elite', value: 5 }, reward: { xp: 1100, statPoints: 2 } },
  { id: 'mid_points_100', name: 'Centenario Midfield', description: 'Consigue 100 puntos en la temporada', tierTarget: ['midfield'], condition: { type: 'season_points', value: 100 }, reward: { xp: 1500, statPoints: 3 } },
  { id: 'mid_pole', name: 'Clasificación de Ensueño', description: 'Consigue una pole position en Q2', tierTarget: ['midfield'], condition: { type: 'poles', value: 1 }, reward: { xp: 1300, statPoints: 2 } },

  // Strong team objectives
  { id: 'str_wins', name: 'Cazador de Victorias', description: 'Gana 3 carreras con un equipo strong', tierTarget: ['strong'], condition: { type: 'wins', value: 3 }, reward: { xp: 2000, statPoints: 3 } },
  { id: 'str_top5_championship', name: 'Top 5 Mundial', description: 'Termina el campeonato en el Top 5', tierTarget: ['strong'], condition: { type: 'championship_position', value: 5 }, reward: { xp: 2500, statPoints: 3 } },
  { id: 'str_sprint_wins', name: 'Especialista Sprint', description: 'Gana 5 carreras al sprint', tierTarget: ['strong'], condition: { type: 'sprint_wins', value: 5 }, reward: { xp: 1800, statPoints: 2 } },
  { id: 'str_manufacturer', name: 'Campeón de Constructores', description: 'Ayuda a tu fabricante a ganar el título de constructores', tierTarget: ['strong'], condition: { type: 'constructor_title', value: 1 }, reward: { xp: 3000, statPoints: 4 } },

  // Elite objectives
  { id: 'eli_title_fight', name: 'Lucha por el Título', description: 'Ve al último GP como líder del campeonato', tierTarget: ['elite'], condition: { type: 'title_fight', value: 1 }, reward: { xp: 3000, statPoints: 3 } },
  { id: 'eli_world_champion', name: '¡Campeón del Mundo!', description: 'Gana el Campeonato del Mundo MotoGP', tierTarget: ['elite'], condition: { type: 'championship_position', value: 1 }, reward: { xp: 5000, statPoints: 5 } },
  { id: 'eli_dominant', name: 'Dominador Absoluto', description: 'Gana 8 o más carreras en una temporada', tierTarget: ['elite'], condition: { type: 'wins', value: 8 }, reward: { xp: 4000, statPoints: 4 } },
  { id: 'eli_double_title', name: 'Bicampeón', description: 'Gana el título en temporadas consecutivas', tierTarget: ['elite'], condition: { type: 'consecutive_titles', value: 2 }, reward: { xp: 8000, statPoints: 6 } },
];
