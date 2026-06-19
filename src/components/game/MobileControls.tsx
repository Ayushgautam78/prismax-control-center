'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store';

type JointKey = 'baseRotation' | 'shoulderAngle' | 'elbowAngle' | 'wristPitch' | 'wristRotation';

const JOINT_TABS: { key: JointKey; label: string; short: string }[] = [
  { key: 'baseRotation', label: 'Base', short: 'B' },
  { key: 'shoulderAngle', label: 'Shoulder', short: 'S' },
  { key: 'elbowAngle', label: 'Elbow', short: 'E' },
  { key: 'wristPitch', label: 'Wrist', short: 'W' },
  { key: 'wristRotation', label: 'W.Rot', short: 'R' },
];

export default function MobileControls() {
  const store = useGameStore();
  const [activeJoint, setActiveJoint] = useState<JointKey>('baseRotation');
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeJointRef = useRef(activeJoint);

  useEffect(() => {
    activeJointRef.current = activeJoint;
  }, [activeJoint]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startMoving = (direction: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const step = 2.0; // smooth degrees per tick
    const tick = () => {
      const joint = activeJointRef.current;
      const current = useGameStore.getState()[joint] as number;
      useGameStore.getState().setJoint(joint, current + direction * step);
      useGameStore.getState().incrementJointMoves(1);
    };

    tick(); // Immediate movement
    intervalRef.current = setInterval(tick, 20); // ~50fps smooth movement
  };

  const stopMoving = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handlePressStart = (direction: number, e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    startMoving(direction);
  };

  const handlePressEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    stopMoving();
  };

  const handleGrip = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    store.setJoint('gripperOpen', store.gripperOpen > 50 ? 0 : 100);
    store.toggleGrip();
  };

  const handleHome = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    store.resetJoints();
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-auto p-3 pb-4 select-none">
      {/* Joint selector strip */}
      <div className="flex justify-center gap-1.5 mb-3 select-none">
        {JOINT_TABS.map((tab) => (
          <motion.button
            key={tab.key}
            onClick={() => setActiveJoint(tab.key)}
            whileTap={{ scale: 0.9 }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none ${
              activeJoint === tab.key
                ? 'bg-[#C5974B] text-black shadow-[0_0_12px_rgba(197,151,75,0.4)]'
                : 'glass text-white/60'
            }`}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.short}</span>
          </motion.button>
        ))}
      </div>

      <div className="flex items-end justify-between select-none">
        {/* D-pad (left side) */}
        <div className="relative w-32 h-32 select-none">
          {/* Up */}
          <motion.button
            whileTap={{ scale: 0.85, backgroundColor: 'rgba(197,151,75,0.3)' }}
            onTouchStart={(e) => handlePressStart(1, e)}
            onMouseDown={(e) => handlePressStart(1, e)}
            onTouchEnd={handlePressEnd}
            onTouchCancel={handlePressEnd}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-11 h-11 glass rounded-xl flex items-center justify-center active:bg-[#C5974B]/20 select-none cursor-pointer"
          >
            <span className="text-[#C5974B] text-lg font-bold select-none">▲</span>
          </motion.button>

          {/* Down */}
          <motion.button
            whileTap={{ scale: 0.85, backgroundColor: 'rgba(197,151,75,0.3)' }}
            onTouchStart={(e) => handlePressStart(-1, e)}
            onMouseDown={(e) => handlePressStart(-1, e)}
            onTouchEnd={handlePressEnd}
            onTouchCancel={handlePressEnd}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-11 h-11 glass rounded-xl flex items-center justify-center active:bg-[#C5974B]/20 select-none cursor-pointer"
          >
            <span className="text-[#C5974B] text-lg font-bold select-none">▼</span>
          </motion.button>

          {/* Left */}
          <motion.button
            whileTap={{ scale: 0.85, backgroundColor: 'rgba(197,151,75,0.3)' }}
            onTouchStart={(e) => handlePressStart(-1, e)}
            onMouseDown={(e) => handlePressStart(-1, e)}
            onTouchEnd={handlePressEnd}
            onTouchCancel={handlePressEnd}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-11 h-11 glass rounded-xl flex items-center justify-center active:bg-[#C5974B]/20 select-none cursor-pointer"
          >
            <span className="text-[#C5974B] text-lg font-bold select-none">◀</span>
          </motion.button>

          {/* Right */}
          <motion.button
            whileTap={{ scale: 0.85, backgroundColor: 'rgba(197,151,75,0.3)' }}
            onTouchStart={(e) => handlePressStart(1, e)}
            onMouseDown={(e) => handlePressStart(1, e)}
            onTouchEnd={handlePressEnd}
            onTouchCancel={handlePressEnd}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 glass rounded-xl flex items-center justify-center active:bg-[#C5974B]/20 select-none cursor-pointer"
          >
            <span className="text-[#C5974B] text-lg font-bold select-none">▶</span>
          </motion.button>

          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span className="text-white/30 text-[10px] font-semibold uppercase select-none">
              {JOINT_TABS.find(t => t.key === activeJoint)?.short}
            </span>
          </div>
        </div>

        {/* Right side - Grip button + Home */}
        <div className="flex flex-col items-center gap-3 select-none">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onTouchStart={handleHome}
            onMouseDown={handleHome}
            className="glass rounded-xl w-14 h-10 flex items-center justify-center select-none cursor-pointer"
          >
            <span className="text-white/50 text-xs font-semibold select-none">HOME</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onTouchStart={handleGrip}
            onMouseDown={handleGrip}
            className={`rounded-full w-20 h-20 flex items-center justify-center font-bold text-sm transition-all select-none cursor-pointer ${
              store.isGripping
                ? 'bg-[#C5974B] text-black shadow-[0_0_25px_rgba(197,151,75,0.6)]'
                : 'glass border-2 border-[#C5974B]/50 text-[#C5974B]'
            }`}
          >
            {store.isGripping ? 'RELEASE' : 'GRIP'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

