'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { formatTime } from '@/lib/utils';
import { HiTrophy, HiClock, HiCube, HiSignal } from 'react-icons/hi2';
import { TbTargetArrow } from 'react-icons/tb';
import { useDeviceDetect } from '@/hooks/useDeviceDetect';

const LEVEL_TASKS: Record<number, string> = {
  1: 'Pick up the object and place it in the box',
  2: 'Pick up both objects and place them in the box',
  3: 'Sort colored objects into matching colored boxes',
};

const AI_MESSAGES = [
  'Trajectory optimized successfully',
  'Robot calibration nominal',
  'Motion stability: excellent',
  'Object detection active',
  'Path planning updated',
  'No collisions detected',
  'AI confidence: high',
  'Session operating normally',
  'Training data recording...',
  'Joint synchronization OK',
  'Gripper force calibrated',
  'Workspace boundaries verified',
  'Control loop: 1000Hz',
  'Telemetry streaming active',
  'Neural network inference: 12ms',
];

export default function GameHUD({ level }: { level: number }) {
  const { phase, timer, score, objectsPlaced, totalObjects } = useGameStore();
  const [aiMessages, setAiMessages] = useState<{ text: string; id: number }[]>([]);
  const [dataPoints, setDataPoints] = useState(0);
  const msgIdRef = useRef(0);
  const { isMobile } = useDeviceDetect();

  // AI message feed
  useEffect(() => {
    if (phase !== 'playing') return;

    const interval = setInterval(() => {
      const msg = AI_MESSAGES[Math.floor(Math.random() * AI_MESSAGES.length)];
      msgIdRef.current += 1;
      setAiMessages(prev => [
        { text: msg, id: msgIdRef.current },
        ...prev.slice(0, 4),
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, [phase]);

  // Training data counter
  useEffect(() => {
    if (phase !== 'playing') return;

    const interval = setInterval(() => {
      setDataPoints(prev => prev + Math.floor(Math.random() * 15) + 5);
    }, 500);

    return () => clearInterval(interval);
  }, [phase]);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 select-none">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-3 md:p-4 select-none">
        <div className="flex items-center justify-between gap-2 select-none">
          {/* Level indicator */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`glass rounded-xl pointer-events-auto select-none ${
              isMobile ? 'px-3 py-1.5' : 'px-4 py-2'
            }`}
          >
            <div className={`text-[#C5974B] font-semibold tracking-wider uppercase ${
              isMobile ? 'text-[10px]' : 'text-xs'
            }`}>
              Level {level}
            </div>
            <div className="text-white/80 text-xs mt-0.5 hidden sm:block">
              {LEVEL_TASKS[level]}
            </div>
          </motion.div>

          {/* Timer */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`glass rounded-xl flex items-center gap-1.5 select-none ${
              isMobile ? 'px-3 py-1.5' : 'px-4 py-2'
            }`}
          >
            <HiClock className="text-[#C5974B] text-base md:text-lg" />
            <span className={`text-white font-mono font-bold ${
              isMobile ? 'text-sm' : 'text-lg'
            }`}>
              {formatTime(timer)}
            </span>
          </motion.div>

          {/* Score */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`glass rounded-xl flex items-center gap-1.5 select-none ${
              isMobile ? 'px-3 py-1.5' : 'px-4 py-2'
            }`}
          >
            <HiTrophy className="text-[#D4A853] text-base md:text-lg" />
            <span className={`text-[#D4A853] font-bold ${
              isMobile ? 'text-sm' : 'text-lg'
            }`}>
              {score}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Objects progress */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={
          isMobile
            ? 'absolute top-[68px] right-3 w-[125px] glass rounded-xl p-2 select-none'
            : 'absolute top-16 md:top-20 right-3 md:right-4 glass rounded-xl px-3 py-2 md:px-4 md:py-3'
        }
      >
        <div className="flex items-center gap-1.5 text-xs md:text-sm select-none">
          <HiCube className="text-[#C5974B]" />
          <span className="text-white/70">Objects:</span>
          <span className="text-[#D4A853] font-bold ml-auto">
            {objectsPlaced}/{totalObjects}
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1 mt-1">
          <motion.div
            className="bg-gradient-to-r from-[#C5974B] to-[#D4A853] h-1 rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: totalObjects > 0 ? `${(objectsPlaced / totalObjects) * 100}%` : '0%',
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* AI Assistant feed */}
      <div
        className={
          isMobile
            ? 'absolute top-[68px] left-3 max-w-[140px] select-none'
            : 'absolute bottom-4 left-3 md:left-4 max-w-xs'
        }
      >
        <AnimatePresence>
          {aiMessages.slice(0, isMobile ? 2 : 3).map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ x: -50, opacity: 0, height: 0 }}
              animate={{ x: 0, opacity: 1, height: 'auto' }}
              exit={{ x: -50, opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`glass rounded-lg mb-1 text-[9px] md:text-xs select-none ${
                isMobile ? 'px-2 py-1' : 'px-3 py-1.5'
              }`}
            >
              <span className="text-[#C5974B] mr-1">AI:</span>
              <span className="text-white/60">{msg.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Training data counter */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className={
          isMobile
            ? 'absolute top-[124px] right-3 w-[125px] glass rounded-xl p-2 select-none'
            : 'absolute bottom-3 md:bottom-4 right-3 md:right-4 glass rounded-xl px-3 py-2'
        }
      >
        <div className="flex items-center gap-1.5 text-[9px] md:text-xs select-none">
          <HiSignal className="text-[#22c55e] animate-pulse flex-shrink-0" />
          <span className="text-white/50 truncate">Data:</span>
          <span className="text-[#22c55e] font-mono font-bold ml-auto">
            {dataPoints}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] md:text-xs mt-0.5 select-none">
          <TbTargetArrow className="text-[#C5974B] flex-shrink-0" />
          <span className="text-white/50 truncate">Rate:</span>
          <span className="text-[#C5974B] font-mono ml-auto">
            ~135/s
          </span>
        </div>
      </motion.div>
    </div>
  );
}

