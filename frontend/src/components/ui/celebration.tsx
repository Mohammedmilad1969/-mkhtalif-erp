'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const PARTICLE_COUNT = 40;

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

type CelebrationType = 'default' | 'confetti' | 'success';

export function useCelebration() {
  const [active, setActive] = useState<{ id: number; type: CelebrationType } | null>(null);

  const fire = useCallback((type: CelebrationType = 'confetti') => {
    setActive({ id: Date.now(), type });
  }, []);

  const dismiss = useCallback(() => {
    setActive(null);
  }, []);

  return { active, fire, dismiss };
}

export function CelebrationOverlay({ active, onComplete }: {
  active: { id: number; type: CelebrationType } | null;
  onComplete?: () => void;
}) {
  if (!active) return null;

  return (
    <AnimatePresence>
      {active.type === 'confetti' && (
        <Confetti key={active.id} onComplete={onComplete} />
      )}
      {active.type === 'success' && (
        <SuccessCheckmark key={active.id} onComplete={onComplete} />
      )}
    </AnimatePresence>
  );
}

function Confetti({ onComplete }: { onComplete?: () => void }) {
  const [particles] = useState(() =>
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: randomBetween(0, 100),
      y: -10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: randomBetween(4, 10),
      rotation: randomBetween(0, 360),
      xEnd: randomBetween(-30, 130),
      yEnd: randomBetween(40, 120),
      duration: randomBetween(1.5, 3),
      delay: randomBetween(0, 0.3),
      shape: Math.random() > 0.5 ? 'circle' : 'rect',
    })),
  );

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: 2.5 }}
      onAnimationComplete={onComplete}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 0.8, 0],
            rotate: [0, p.rotation, p.rotation + 180],
            left: `${p.xEnd}%`,
            top: `${p.yEnd}%`,
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeInOut' }}
        >
          {p.shape === 'circle' ? (
            <div
              className="rounded-full"
              style={{ width: p.size, height: p.size, background: p.color }}
            />
          ) : (
            <div
              className="rounded-sm"
              style={{ width: p.size * 0.6, height: p.size * 1.2, background: p.color, rotate: `${p.rotation}deg` }}
            />
          )}
        </motion.div>
      ))}
      <motion.div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        🎉
      </motion.div>
    </motion.div>
  );
}

function SuccessCheckmark({ onComplete }: { onComplete?: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 bg-background/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onAnimationComplete={onComplete}
    >
      <motion.div
        className="bg-card rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-3"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
      >
        <motion.div
          className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 12 }}
        >
          <motion.svg
            viewBox="0 0 24 24"
            className="w-8 h-8 text-white"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <motion.path
              d="M5 13l4 4L19 7"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            />
          </motion.svg>
        </motion.div>
        <motion.p
          className="text-lg font-semibold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Success!
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
