import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useGameStore } from '../store/gameStore';
import { Card } from '../components/ui/Card';
import { StatBar } from '../components/ui/StatBar';
import { XPBar } from '../components/ui/XPBar';
import { UPGRADES } from '../data/upgrades';
import { TEAMS_2026 } from '../data/teams2026';
import { saveCharacter } from '../services/gameService';
import type { RiderStats } from '../types';

const STAT_INFO: { key: keyof RiderStats; label: string; icon: string }[] = [
  { key: 'velocidad', label: 'Velocidad', icon: '⚡' },
  { key: 'frenada', label: 'Frenada', icon: '🛑' },
  { key: 'pasoCurva', label: 'Paso por Curva', icon: '🔄' },
  { key: 'aceleracion', label: 'Aceleración', icon: '🚀' },
  { key: 'tiempoMojado', label: 'Tiempo Mojado', icon: '🌧️' },
  { key: 'gestionNeumaticos', label: 'Gest. Neumáticos', icon: '🔵' },
];

const CATEGORY_LABELS: Record<string, string> = {
  pilotaje: '🏍️ Pilotaje',
  estrategia: '📊 Estrategia',
  mental: '🧠 Mental',
  fisico: '💪 Físico',
};

export function Profile() {
  const { character, setCharacter, season } = useGameStore();
  const [tab, setTab] = useState<'stats' | 'upgrades'>('stats');
  const [saving, setSaving] = useState(false);

  if (!character) return null;

  const team = TEAMS_2026.find(t => t.id === character.teamId);
  const playerStanding = season?.driverStandings.find(s => s.riderId === character.id);

  async function addStatPoint(key: keyof RiderStats) {
    if (!character || character.statPoints <= 0) return;
    if (character.stats[key] >= 99) return;
    setSaving(true);
    try {
      const newStats = { ...character.stats, [key]: character.stats[key] + 1 };
      const updated = { ...character, stats: newStats, statPoints: character.statPoints - 1 };
      await saveCharacter(updated);
      setCharacter(updated);
      toast.success(`+1 ${key}`);
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function buyUpgrade(upgradeId: string) {
    if (!character) return;
    const upgrade = UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return;
    if (character.xp < upgrade.xpCost) { toast.error('XP insuficiente'); return; }
    if (character.level < upgrade.levelRequired) { toast.error(`Nivel ${upgrade.levelRequired} requerido`); return; }
    if (character.upgrades.includes(upgradeId)) { toast.error('Ya tienes esta mejora'); return; }
    if (upgrade.prerequisiteId && !character.upgrades.includes(upgrade.prerequisiteId)) {
      toast.error('Desbloquea la mejora previa primero'); return;
    }
    setSaving(true);
    try {
      const newStats: RiderStats = { ...character.stats };
      Object.entries(upgrade.statBonus).forEach(([k, v]) => {
        const key = k as keyof RiderStats;
        newStats[key] = Math.min(99, newStats[key] + (v ?? 0));
      });
      const updated = {
        ...character,
        stats: newStats,
        xp: character.xp - upgrade.xpCost,
        upgrades: [...character.upgrades, upgradeId],
      };
      await saveCharacter(updated);
      setCharacter(updated);
      toast.success(`✅ ${upgrade.name} desbloqueado!`);
    } catch {
      toast.error('Error al comprar mejora');
    } finally {
      setSaving(false);
    }
  }

  const categories = ['pilotaje', 'estrategia', 'mental', 'fisico'] as const;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card glow className="mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4" style={{ backgroundColor: character.avatarStyle.cascoColor, borderColor: character.avatarStyle.cascoAccent }} />
              <div className="absolute -bottom-1 -right-1 bg-motogp-dark text-white text-xs font-orbitron font-bold px-1 rounded border border-white/20">#{character.numero}</div>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500" style={{ color: team?.color }}>{team?.manufacturer} · {team?.shortName}</p>
              <h1 className="font-orbitron font-black text-xl text-white">{character.nombre} {character.apellido}</h1>
              <p className="text-sm text-gray-400">{character.nacionalidad}</p>
              <div className="mt-2">
                <XPBar xp={character.xp} xpToNext={character.xpToNextLevel} level={character.level} />
              </div>
            </div>
          </div>
          {character.statPoints > 0 && (
            <div className="mt-3 p-2 bg-motogp-red/10 border border-motogp-red/20 rounded-lg text-sm text-motogp-red text-center">
              🎯 {character.statPoints} puntos de stat disponibles
            </div>
          )}
        </Card>

        {/* Mini stats carrera */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Victorias', v: playerStanding?.wins ?? 0, icon: '🏆' },
            { label: 'Podios', v: playerStanding?.podiums ?? 0, icon: '🥉' },
            { label: 'Poles', v: playerStanding?.poles ?? 0, icon: '⚡' },
          ].map(s => (
            <Card key={s.label} className="text-center py-3">
              <p className="text-xl">{s.icon}</p>
              <p className="text-xl font-black font-orbitron text-white">{s.v}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(['stats', 'upgrades'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-motogp-red text-white' : 'bg-white/10 text-gray-400 hover:text-white'}`}
            >
              {t === 'stats' ? '📊 Stats' : '🔧 Mejoras'}
            </button>
          ))}
        </div>

        {/* Stats tab */}
        {tab === 'stats' && (
          <Card>
            <p className="text-xs text-gray-500 mb-3">Puntos disponibles: <span className="text-motogp-red font-bold">{character.statPoints}</span></p>
            <div className="space-y-3">
              {STAT_INFO.map(({ key, label, icon }) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">{icon} {label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold font-orbitron">{character.stats[key]}</span>
                      {character.statPoints > 0 && character.stats[key] < 99 && (
                        <button
                          onClick={() => addStatPoint(key)}
                          disabled={saving}
                          className="w-6 h-6 rounded bg-motogp-red text-white text-xs hover:bg-red-600 flex items-center justify-center"
                        >+</button>
                      )}
                    </div>
                  </div>
                  <StatBar label="" value={character.stats[key]} />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Upgrades tab */}
        {tab === 'upgrades' && (
          <div className="space-y-4">
            {categories.map(cat => {
              const catUpgrades = UPGRADES.filter(u => u.category === cat);
              return (
                <div key={cat}>
                  <h3 className="text-sm font-bold text-gray-400 mb-2">{CATEGORY_LABELS[cat]}</h3>
                  <div className="space-y-2">
                    {catUpgrades.map(upgrade => {
                      const owned = character.upgrades.includes(upgrade.id);
                      const canAfford = character.xp >= upgrade.xpCost;
                      const meetsLevel = character.level >= upgrade.levelRequired;
                      const prereqMet = !upgrade.prerequisiteId || character.upgrades.includes(upgrade.prerequisiteId);
                      const available = canAfford && meetsLevel && prereqMet && !owned;
                      return (
                        <Card key={upgrade.id} className={owned ? 'border-green-500/30 bg-green-500/5' : ''}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-bold text-white">{upgrade.name}</p>
                                {owned && <span className="text-xs text-green-400">✓ Desbloqueado</span>}
                              </div>
                              <p className="text-xs text-gray-500 mb-2">{upgrade.description}</p>
                              <div className="flex gap-2 flex-wrap text-xs">
                                {Object.entries(upgrade.statBonus).map(([k, v]) => (
                                  <span key={k} className="bg-motogp-red/20 text-motogp-red px-1.5 py-0.5 rounded">
                                    +{v} {k}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {!owned && (
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs text-gray-400 mb-1">Niv.{upgrade.levelRequired} · {upgrade.xpCost.toLocaleString()} XP</p>
                                <button
                                  onClick={() => buyUpgrade(upgrade.id)}
                                  disabled={!available || saving}
                                  className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                                    available ? 'bg-motogp-red text-white hover:bg-red-600' : 'bg-white/10 text-gray-500 cursor-not-allowed'
                                  }`}
                                >
                                  {!meetsLevel ? `Niv.${upgrade.levelRequired}` : !canAfford ? 'Sin XP' : !prereqMet ? 'Bloqueado' : 'Comprar'}
                                </button>
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
