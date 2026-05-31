import type { Achievement } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  // Primera vez
  { id: 'first_race', name: 'Debut en MotoGP', description: 'Completa tu primera carrera en MotoGP', icon: '🏁', rarity: 'bronze', xpReward: 200, condition: { type: 'special', value: 1, extra: { event: 'first_race' } } },
  { id: 'first_points', name: 'Primeros Puntos', description: 'Consigue tus primeros puntos mundiales', icon: '📊', rarity: 'bronze', xpReward: 300, condition: { type: 'points', value: 1 } },
  { id: 'first_podium', name: 'Primer Podio', description: 'Sube al podio por primera vez', icon: '🥉', rarity: 'silver', xpReward: 500, condition: { type: 'podiums', value: 1 } },
  { id: 'first_pole', name: 'Primera Pole Position', description: 'Logra tu primera pole position', icon: '⚡', rarity: 'silver', xpReward: 500, condition: { type: 'poles', value: 1 } },
  { id: 'first_win', name: 'Primera Victoria', description: 'Gana tu primera carrera en MotoGP', icon: '🏆', rarity: 'gold', xpReward: 1000, condition: { type: 'wins', value: 1 } },
  { id: 'first_sprint_win', name: 'Primer Sprint', description: 'Gana tu primera carrera al sprint', icon: '⚡', rarity: 'silver', xpReward: 400, condition: { type: 'special', value: 1, extra: { event: 'sprint_win' } } },

  // Victorias acumuladas
  { id: 'wins_5', name: 'Ganador', description: 'Consigue 5 victorias en MotoGP', icon: '🥇', rarity: 'silver', xpReward: 1500, condition: { type: 'wins', value: 5 } },
  { id: 'wins_10', name: 'Dominador', description: 'Consigue 10 victorias en MotoGP', icon: '💪', rarity: 'gold', xpReward: 3000, condition: { type: 'wins', value: 10 } },
  { id: 'wins_20', name: 'Leyenda', description: 'Consigue 20 victorias en MotoGP', icon: '🌟', rarity: 'platinum', xpReward: 6000, condition: { type: 'wins', value: 20 } },
  { id: 'wins_50', name: 'Inmortal', description: '50 victorias — eres historia del motorsport', icon: '🌌', rarity: 'legendary', xpReward: 15000, condition: { type: 'wins', value: 50 } },

  // Podios
  { id: 'podiums_10', name: 'Hombre del Podio', description: '10 podios en tu carrera', icon: '🎯', rarity: 'silver', xpReward: 2000, condition: { type: 'podiums', value: 10 } },
  { id: 'podiums_30', name: 'Maestro del Podio', description: '30 podios — una carrera de élite', icon: '✨', rarity: 'gold', xpReward: 5000, condition: { type: 'podiums', value: 30 } },

  // Poles
  { id: 'poles_5', name: 'Especialista en Clasificación', description: '5 poles en tu carrera', icon: '🎯', rarity: 'silver', xpReward: 1500, condition: { type: 'poles', value: 5 } },
  { id: 'poles_20', name: 'Rey de la Clasificación', description: '20 poles — dominas el sábado', icon: '👑', rarity: 'gold', xpReward: 4000, condition: { type: 'poles', value: 20 } },

  // Circuitos especiales
  { id: 'mugello_win', name: 'Mago de Mugello', description: 'Gana el Gran Premio de Italia en Mugello', icon: '🇮🇹', rarity: 'gold', xpReward: 2000, condition: { type: 'special', value: 1, extra: { event: 'circuit_win', circuitId: 'italy' } } },
  { id: 'sachsenring_win', name: 'König des Sachsenrings', description: 'Gana en el técnico Sachsenring', icon: '🇩🇪', rarity: 'gold', xpReward: 2000, condition: { type: 'special', value: 1, extra: { event: 'circuit_win', circuitId: 'germany' } } },
  { id: 'phillip_win', name: 'Amo de Phillip Island', description: 'Gana en el veloz Phillip Island', icon: '🇦🇺', rarity: 'gold', xpReward: 2000, condition: { type: 'special', value: 1, extra: { event: 'circuit_win', circuitId: 'australia' } } },
  { id: 'qatar_win', name: 'Príncipe de Lusail', description: 'Gana la carrera nocturna de Qatar', icon: '🌙', rarity: 'gold', xpReward: 2000, condition: { type: 'special', value: 1, extra: { event: 'circuit_win', circuitId: 'qatar' } } },

  // Rachas
  { id: 'streak_3', name: 'Tricampeón de Ronda', description: 'Gana 3 carreras consecutivas', icon: '🔥', rarity: 'gold', xpReward: 3000, condition: { type: 'streak', value: 3 } },
  { id: 'streak_5', name: 'Imparable', description: 'Gana 5 carreras consecutivas', icon: '🔥🔥', rarity: 'platinum', xpReward: 6000, condition: { type: 'streak', value: 5 } },

  // Fines de semana perfectos
  { id: 'perfect_weekend', name: 'Fin de Semana Perfecto', description: 'Pole + Sprint + Carrera + Vuelta Rápida en el mismo GP', icon: '💎', rarity: 'legendary', xpReward: 8000, condition: { type: 'special', value: 1, extra: { event: 'perfect_weekend' } } },
  { id: 'pole_win', name: 'Wire-to-Wire', description: 'Pole position y victoria en la misma carrera', icon: '🎯', rarity: 'gold', xpReward: 2500, condition: { type: 'special', value: 1, extra: { event: 'pole_and_win' } } },

  // Lluvia
  { id: 'rain_master', name: 'Maestro de la Lluvia', description: 'Gana una carrera en condiciones de mojado', icon: '🌧️', rarity: 'gold', xpReward: 2500, condition: { type: 'special', value: 1, extra: { event: 'wet_win' } } },
  { id: 'rain_god', name: 'Dios de la Lluvia', description: 'Gana 5 carreras en lluvia', icon: '⛈️', rarity: 'platinum', xpReward: 6000, condition: { type: 'special', value: 5, extra: { event: 'wet_win' } } },

  // Campeonato
  { id: 'title_top5', name: 'Luchador por el Título', description: 'Termina el campeonato en el Top 5', icon: '🏅', rarity: 'gold', xpReward: 3000, condition: { type: 'position', value: 5 } },
  { id: 'title_top3', name: 'Aspirante al Mundial', description: 'Termina el campeonato en el Top 3', icon: '🥉', rarity: 'platinum', xpReward: 5000, condition: { type: 'position', value: 3 } },
  { id: 'world_champion', name: '¡Campeón del Mundo!', description: 'Gana el Campeonato del Mundo MotoGP', icon: '🌍', rarity: 'legendary', xpReward: 10000, condition: { type: 'position', value: 1 } },
  { id: 'back_to_back', name: 'Bicampeón', description: 'Gana el Mundial dos temporadas seguidas', icon: '👑👑', rarity: 'legendary', xpReward: 12000, condition: { type: 'special', value: 2, extra: { event: 'consecutive_titles' } } },

  // Equipo
  { id: 'backmarker_podium', name: 'Milagro del Motor', description: 'Consigue un podio con Honda', icon: '🙏', rarity: 'platinum', xpReward: 5000, condition: { type: 'special', value: 1, extra: { event: 'backmarker_podium' } } },
  { id: 'move_to_elite', name: 'Ascenso a la Élite', description: 'Consigue fichar por un equipo de élite', icon: '⬆️', rarity: 'gold', xpReward: 2000, condition: { type: 'special', value: 1, extra: { event: 'elite_team' } } },

  // Puntuación
  { id: 'points_100', name: 'Centenario', description: 'Consigue 100 puntos mundiales en una temporada', icon: '💯', rarity: 'silver', xpReward: 1500, condition: { type: 'points', value: 100 } },
  { id: 'points_250', name: 'Titular de Puntos', description: '250 puntos en una temporada', icon: '📈', rarity: 'gold', xpReward: 3000, condition: { type: 'points', value: 250 } },
  { id: 'points_400', name: 'Máquina de Puntos', description: '400 puntos en una temporada — cerca del máximo', icon: '💥', rarity: 'platinum', xpReward: 6000, condition: { type: 'points', value: 400 } },

  // Nivel
  { id: 'level_10', name: 'Piloto Profesional', description: 'Alcanza el nivel 10', icon: '⭐', rarity: 'silver', xpReward: 1000, condition: { type: 'special', value: 10, extra: { event: 'level_up' } } },
  { id: 'level_25', name: 'Veterano del Paddock', description: 'Alcanza el nivel 25', icon: '⭐⭐', rarity: 'gold', xpReward: 2500, condition: { type: 'special', value: 25, extra: { event: 'level_up' } } },
  { id: 'level_50', name: 'Leyenda Viviente', description: 'Alcanza el nivel 50 — eres de otra dimensión', icon: '⭐⭐⭐', rarity: 'legendary', xpReward: 8000, condition: { type: 'special', value: 50, extra: { event: 'level_up' } } },

  // Especiales Brasil/Nuevos circuitos
  { id: 'brazil_win', name: 'Samba Campeão', description: 'Gana el histórico regreso a Brasil', icon: '🇧🇷', rarity: 'gold', xpReward: 2000, condition: { type: 'special', value: 1, extra: { event: 'circuit_win', circuitId: 'brazil' } } },
  { id: 'hungary_win', name: 'Conquistador Húngaro', description: 'Gana en el nuevo circuito de Hungría', icon: '🇭🇺', rarity: 'gold', xpReward: 2000, condition: { type: 'special', value: 1, extra: { event: 'circuit_win', circuitId: 'hungary' } } },
];
