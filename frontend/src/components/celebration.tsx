'use client';

import { useEffect, useState } from 'react';

const MOTIVATIONS = [
  'You turned a lead into a win! 🎉',
  'Another deal closed! Keep crushing it! 🚀',
  'Success starts with a closed deal. Well done! 💪',
  'One more happy client — great job! 🔥',
  'Your persistence paid off! 🌟',
  'Won! Your pipeline is unstoppable! ⚡',
  'From prospect to client — you nailed it! 🎯',
  'Every win builds momentum. Keep going! 🏆',
  'Client onboarded. Time to celebrate! 🥳',
  'Your sales skills are on fire! 🔥',
];

interface CelebrationProps {
  show: boolean;
  onClose?: () => void;
}

function randomConfetti(count: number) {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.5,
    duration: 1.5 + Math.random() * 2,
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));
}

export default function Celebration({ show, onClose }: CelebrationProps) {
  const [particles, setParticles] = useState<ReturnType<typeof randomConfetti>>([]);
  const [motivation, setMotivation] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setParticles(randomConfetti(40));
      setMotivation(MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)]);
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [show, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-fall"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: '2px',
            transform: `rotate(${p.rotation}deg)`,
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
      <div className="bg-background/80 backdrop-blur-sm rounded-xl px-8 py-6 shadow-2xl border text-center animate-bounce-in pointer-events-auto max-w-sm">
        <div className="text-5xl mb-3">🎉</div>
        <p className="text-lg font-bold text-green-600 dark:text-green-400">Deal Won!</p>
        <p className="text-sm text-muted-foreground mt-2">{motivation}</p>
      </div>
      <style jsx>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
