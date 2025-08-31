'use client';

import { motion } from 'framer-motion';

interface ParticlesBackgroundProps {
  isDark: boolean;
}

export function ParticlesBackground({ isDark }: ParticlesBackgroundProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Animated Grid Pattern */}
      <div className={`absolute inset-0 ${isDark ? 'opacity-20' : 'opacity-10'}`}>
        <div className="grid grid-cols-20 gap-1 h-full w-full p-2">
          {Array.from({ length: 200 }).map((_, i) => (
            <motion.div
              key={i}
              className={`rounded-sm ${isDark ? 'bg-orange-400/10' : 'bg-orange-500/5'}`}
              animate={{ 
                opacity: [0.1, 0.4, 0.1],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 4
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${isDark ? 'bg-orange-400/40' : 'bg-orange-500/30'}`}
            style={{
              left: `${15 + i * 10}%`,
              top: `${25 + i * 8}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 8 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
}
