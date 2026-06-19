'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { calculateScore } from '@/lib/scoring';
import GameHUD from '@/components/game/GameHUD';
import JointControlPanel from '@/components/game/JointControlPanel';
import MobileControls from '@/components/game/MobileControls';
import InstructionsOverlay from '@/components/game/InstructionsOverlay';
import LevelCompleteModal from '@/components/game/LevelCompleteModal';
import { useDeviceDetect } from '@/hooks/useDeviceDetect';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { HiPlay, HiStop, HiQuestionMarkCircle, HiArrowLeft } from 'react-icons/hi2';

// Dynamically import the heavy 3D scene to avoid SSR issues
const GameScene = dynamic(() => import('@/components/game/GameScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-[#C5974B]/30 border-t-[#C5974B] rounded-full animate-spin" />
        <p className="text-[#C5974B] font-medium animate-pulse">
          Initializing 3D Environment...
        </p>
      </div>
    </div>
  ),
});

const LEVEL_CONFIG: Record<number, { title: string; objects: number }> = {
  1: { title: 'Pick & Place', objects: 5 },
  2: { title: 'Multi-Shape Sorting', objects: 10 },
  3: { title: 'Color Sorting Challenge', objects: 18 },
};

export default function GamePage({ params }: { params: Promise<{ level: string }> }) {
  const resolvedParams = use(params);
  const level = parseInt(resolvedParams.level) || 1;
  const router = useRouter();
  const { isMobile } = useDeviceDetect();
  const [showInstructions, setShowInstructions] = useState(false);
  const [showJoints, setShowJoints] = useState(!isMobile);
  const [showStartOverlay, setShowStartOverlay] = useState(true);

  // States for Level Complete Modal
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionStats, setCompletionStats] = useState({
    score: 0,
    timer: 0,
    stars: 0,
    precision: 0,
    trainingPoints: 0,
  });

  const {
    phase,
    timer,
    objectsPlaced,
    userName,
    startGame,
    endGame,
    incrementTimer,
    setLastReport,
    addPoints,
    addSession,
    unlockAchievement,
    addTrainingDataPoints,
    addThreeStarLevel,
  } = useGameStore();

  // Enable keyboard controls on PC
  useKeyboardControls(phase === 'playing');

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;

    const interval = setInterval(() => {
      incrementTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, incrementTimer]);

  const handleStartGame = useCallback(() => {
    const config = LEVEL_CONFIG[level];
    if (!config) return;

    setShowStartOverlay(false);
    setShowCompleteModal(false);
    startGame(level as 1 | 2 | 3, config.objects);
  }, [level, startGame]);

  const handleEndGame = useCallback(() => {
    const config = LEVEL_CONFIG[level];
    if (!config) return;

    // Read current values from store snapshot to avoid stale closures
    // (reading from closure would cause handleEndGame to recreate every second
    //  due to `timer` incrementing, which breaks the setTimeout in the useEffect)
    const snap = useGameStore.getState();
    const currentTimer = snap.timer;
    const currentPlaced = snap.objectsPlaced;

    endGame();

    const report = calculateScore(currentTimer, currentPlaced, config.objects, level);
    
    // Store stats for final Modal display
    setCompletionStats({
      score: report.totalPoints,
      timer: currentTimer,
      stars: report.stars,
      precision: report.precisionScore,
      trainingPoints: report.trainingDataPoints,
    });

    setLastReport({
      ...report,
      level,
      completionTime: currentTimer,
      objectsPlaced: currentPlaced,
      totalObjects: config.objects,
    });

    addPoints(report.totalPoints);
    addTrainingDataPoints(report.trainingDataPoints);

    // Unlock each earned achievement
    for (const achId of report.achievementsUnlocked) {
      unlockAchievement(achId);
    }

    // Track 3-star levels
    if (report.stars === 3) {
      addThreeStarLevel(level);
    }

    addSession({
      id: `session-${Date.now()}`,
      date: new Date().toISOString(),
      level,
      duration: currentTimer,
      precision: report.precisionScore,
      objectsPlaced: currentPlaced,
      totalObjects: config.objects,
      pointsEarned: report.totalPoints,
      stars: report.stars,
      trainingDataPoints: report.trainingDataPoints,
    });

    // Show the on-screen completion modal!
    setShowCompleteModal(true);
  }, [level, endGame, setLastReport, addPoints, addSession, unlockAchievement, addTrainingDataPoints, addThreeStarLevel]);

  // Check level completion
  useEffect(() => {
    const config = LEVEL_CONFIG[level];
    if (!config) return;

    if (phase === 'playing' && objectsPlaced >= config.objects) {
      const timer = setTimeout(() => {
        handleEndGame();
      }, 1000); // 1-second delay so final object is shown sliding and shrinking into box!
      return () => clearTimeout(timer);
    }
  }, [objectsPlaced, phase, level, handleEndGame]);

  const config = LEVEL_CONFIG[level];
  if (!config) {
    router.push('/play');
    return null;
  }

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] overflow-hidden">
      {/* 3D Scene fills the viewport */}
      <GameScene key={level} level={level} />

      {/* Game HUD overlay */}
      {phase === 'playing' && <GameHUD level={level} />}

      {/* Joint control panel (PC) */}
      {phase === 'playing' && !isMobile && (
        <JointControlPanel isOpen={showJoints} onToggle={() => setShowJoints(!showJoints)} />
      )}

      {/* Mobile controls */}
      {phase === 'playing' && isMobile && <MobileControls />}

      {/* Top-right buttons */}
      <div className="absolute top-3 md:top-4 right-3 md:right-4 z-30 flex gap-2">
        {phase === 'playing' && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowInstructions(true)}
              className="glass rounded-xl p-2 text-[#C5974B] hover:bg-[#C5974B]/10 transition-colors"
            >
              <HiQuestionMarkCircle size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEndGame}
              className="glass rounded-xl px-3 py-2 text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <HiStop size={16} />
              <span className="hidden sm:inline">End Session</span>
            </motion.button>
          </>
        )}
      </div>

      {/* Start game overlay */}
      <AnimatePresence>
        {showStartOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="glass-strong rounded-3xl p-8 md:p-10 max-w-md w-full mx-4 text-center"
            >
              <div className="text-5xl mb-4">🤖</div>
              <h2 className="text-3xl font-bold gold-gradient-text font-[family-name:var(--font-outfit)] mb-2">
                Level {level}
              </h2>
              <h3 className="text-xl text-white/80 font-semibold mb-4">
                {config.title}
              </h3>
              <p className="text-white/50 text-sm mb-6">
                {level === 1 && 'Pick up all 5 objects and place them in the box. Faster = more points!'}
                {level === 2 && 'Sort 10 unique shapes into the drop boxes. Speed matters!'}
                {level === 3 &&
                  'Sort 18 colored blocks into their matching colored boxes. Match colors for points!'}
              </p>

              {userName && (
                <p className="text-[#C5974B]/80 text-sm mb-6">
                  Operator: <span className="font-bold text-[#D4A853]">{userName}</span>
                </p>
              )}

              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStartGame}
                  className="gold-gradient-bg text-black font-bold py-3.5 rounded-xl text-lg flex items-center justify-center gap-2 gold-glow hover:brightness-110 transition-all"
                >
                  <HiPlay size={22} />
                  Start Session
                </motion.button>

                <button
                  onClick={() => setShowInstructions(true)}
                  className="text-[#C5974B]/70 hover:text-[#C5974B] text-sm transition-colors py-2"
                >
                  How to Play?
                </button>

                <button
                  onClick={() => router.push('/play')}
                  className="text-white/40 hover:text-white/70 text-sm transition-colors flex items-center justify-center gap-1"
                >
                  <HiArrowLeft size={14} />
                  Back to Level Select
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions overlay */}
      <InstructionsOverlay
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        isMobile={isMobile}
      />

      {/* Level Completion Modal & Certificate Generator Overlay */}
      <LevelCompleteModal
        isOpen={showCompleteModal}
        level={level}
        score={completionStats.score}
        timer={completionStats.timer}
        stars={completionStats.stars}
        precision={completionStats.precision}
        trainingPoints={completionStats.trainingPoints}
        onRetry={() => {
          setShowCompleteModal(false);
          handleStartGame();
        }}
      />
    </div>
  );
}
