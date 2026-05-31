import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StartLightsProps {
  onComplete: () => void;
}

export function StartLights({ onComplete }: StartLightsProps) {
  const [lit, setLit] = useState(0);
  const [allOut, setAllOut] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= 5; i++) {
      timers.push(setTimeout(() => setLit(i), i * 600));
    }
    timers.push(setTimeout(() => {
      setAllOut(true);
      setTimeout(onComplete, 800);
    }, 3800));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50">
      <p className="text-gray-400 font-orbitron text-sm mb-8 tracking-widest">GRAN PREMIO — LUCES EN PREPARACIÓN</p>
      <div className="flex gap-4 mb-8">
        {[1, 2, 3, 4, 5].map(n => (
          <motion.div
            key={n}
            animate={{
              backgroundColor: allOut ? '#111' : lit >= n ? '#E40317' : '#222',
              boxShadow: !allOut && lit >= n ? '0 0 24px #E40317, 0 0 48px #E40317' : 'none',
            }}
            transition={{ duration: 0.15 }}
            className="w-14 h-14 rounded-full border-2 border-gray-600"
          />
        ))}
      </div>
      <AnimatePresence>
        {allOut && (
          <motion.p
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-motogp-red font-orbitron text-3xl font-black tracking-widest"
          >
            ¡ARRANCAMOS!
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
