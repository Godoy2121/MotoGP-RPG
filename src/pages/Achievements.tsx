import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { Card } from '../components/ui/Card';
import { ACHIEVEMENTS } from '../data/achievements';

const RARITY_COLORS: Record<string, string> = {
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  platinum: '#00b8a9',
  legendary: '#E40317',
};

const RARITY_LABELS: Record<string, string> = {
  bronze: 'Bronce', silver: 'Plata', gold: 'Oro', platinum: 'Platino', legendary: 'Legendario',
};

export function Achievements() {
  const { user } = useGameStore();
  const unlocked = user?.achievements ?? [];

  const byRarity = ['legendary', 'platinum', 'gold', 'silver', 'bronze'] as const;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-orbitron font-black text-2xl text-white">Logros</h1>
        <span className="text-sm text-gray-400">{unlocked.length} / {ACHIEVEMENTS.length}</span>
      </div>

      <div className="h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-motogp-red to-orange-500 rounded-full transition-all duration-700"
          style={{ width: `${(unlocked.length / ACHIEVEMENTS.length) * 100}%` }}
        />
      </div>

      {byRarity.map(rarity => {
        const group = ACHIEVEMENTS.filter(a => a.rarity === rarity);
        return (
          <div key={rarity} className="mb-6">
            <h2 className="text-sm font-orbitron font-bold mb-3 flex items-center gap-2" style={{ color: RARITY_COLORS[rarity] }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: RARITY_COLORS[rarity] }} />
              {RARITY_LABELS[rarity]} ({group.filter(a => unlocked.includes(a.id)).length}/{group.length})
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {group.map((achievement, i) => {
                const isUnlocked = unlocked.includes(achievement.id);
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Card className={`flex items-center gap-3 ${isUnlocked ? '' : 'opacity-40 grayscale'}`}>
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>{achievement.name}</p>
                        <p className="text-xs text-gray-500">{achievement.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold" style={{ color: RARITY_COLORS[rarity] }}>
                          +{achievement.xpReward.toLocaleString()} XP
                        </p>
                        {isUnlocked && <span className="text-xs text-green-400">✓</span>}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
