'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiXMark } from 'react-icons/hi2';

interface InstructionsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

const PC_CONTROLS = [
  { keys: 'A / D', action: 'Rotate base left / right' },
  { keys: 'W / S', action: 'Shoulder up / down' },
  { keys: 'Q / E', action: 'Elbow up / down' },
  { keys: 'Z / X', action: 'Wrist pitch up / down' },
  { keys: 'R / F', action: 'Wrist rotate CW / CCW' },
  { keys: 'Space', action: 'Toggle gripper (grip / release)' },
  { keys: 'Shift', action: 'Speed boost (hold)' },
  { keys: 'H', action: 'Home / reset position' },
];

export default function InstructionsOverlay({
  isOpen,
  onClose,
  isMobile,
}: InstructionsOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="glass-strong rounded-2xl p-6 md:p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold gold-gradient-text font-[family-name:var(--font-outfit)]">
                How to Play
              </h2>
              <button
                onClick={onClose}
                className="text-white/50 hover:text-white transition-colors p-1"
              >
                <HiXMark size={24} />
              </button>
            </div>

            {/* Objective */}
            <div className="glass rounded-xl p-4 mb-6">
              <h3 className="text-[#C5974B] font-semibold mb-2">🎯 Objective</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Control the robotic arm to pick up objects and place them in the
                correct boxes. Move each joint, position the gripper over an object,
                grip it, carry it to the target box, and release. Complete the task
                as fast and precisely as possible to earn maximum points!
              </p>
            </div>

            {/* Controls */}
            <div className="mb-6">
              <h3 className="text-[#C5974B] font-semibold mb-3">
                🎮 {isMobile ? 'Touch Controls' : 'Keyboard Controls'}
              </h3>

              {isMobile ? (
                <div className="space-y-3 text-sm">
                  <div className="glass rounded-lg p-3">
                    <span className="text-[#D4A853] font-semibold">Joint Tabs:</span>
                    <span className="text-white/60 ml-2">
                      Tap a joint name at the top to select which joint to move
                    </span>
                  </div>
                  <div className="glass rounded-lg p-3">
                    <span className="text-[#D4A853] font-semibold">D-Pad:</span>
                    <span className="text-white/60 ml-2">
                      Use the directional buttons to move the selected joint
                    </span>
                  </div>
                  <div className="glass rounded-lg p-3">
                    <span className="text-[#D4A853] font-semibold">GRIP Button:</span>
                    <span className="text-white/60 ml-2">
                      Large button on the right — tap to grip/release objects
                    </span>
                  </div>
                  <div className="glass rounded-lg p-3">
                    <span className="text-[#D4A853] font-semibold">HOME:</span>
                    <span className="text-white/60 ml-2">
                      Reset all joints to starting position
                    </span>
                  </div>
                  <div className="glass rounded-lg p-3">
                    <span className="text-[#D4A853] font-semibold">Camera:</span>
                    <span className="text-white/60 ml-2">
                      Touch drag on the 3D view to orbit, pinch to zoom
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {PC_CONTROLS.map((ctrl) => (
                    <div
                      key={ctrl.keys}
                      className="flex items-center gap-3 glass rounded-lg px-3 py-2"
                    >
                      <kbd className="bg-[#C5974B]/20 text-[#D4A853] px-2.5 py-0.5 rounded text-xs font-mono font-bold min-w-[70px] text-center border border-[#C5974B]/30">
                        {ctrl.keys}
                      </kbd>
                      <span className="text-white/60 text-sm">{ctrl.action}</span>
                    </div>
                  ))}
                  <div className="glass rounded-lg px-3 py-2 mt-2">
                    <span className="text-[#D4A853] text-xs font-semibold">Camera:</span>
                    <span className="text-white/50 text-xs ml-2">
                      Left-click drag to orbit • Scroll to zoom • Right-click drag to pan
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Levels info */}
            <div className="mb-6">
              <h3 className="text-[#C5974B] font-semibold mb-3">📋 Levels</h3>
              <div className="space-y-2 text-sm">
                <div className="glass rounded-lg p-3">
                  <span className="text-[#D4A853] font-bold">Level 1:</span>
                  <span className="text-white/60 ml-2">
                    Pick 1 object → Drop in 1 box
                  </span>
                </div>
                <div className="glass rounded-lg p-3">
                  <span className="text-[#D4A853] font-bold">Level 2:</span>
                  <span className="text-white/60 ml-2">
                    Pick 2 objects → Drop in 1 box
                  </span>
                </div>
                <div className="glass rounded-lg p-3">
                  <span className="text-[#D4A853] font-bold">Level 3:</span>
                  <span className="text-white/60 ml-2">
                    3 colored objects → Match to 3 colored boxes
                  </span>
                </div>
              </div>
            </div>

            {/* Scoring */}
            <div className="glass rounded-xl p-4 mb-6">
              <h3 className="text-[#C5974B] font-semibold mb-2">⭐ Scoring</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Points are awarded based on speed, precision, and the level
                difficulty. Complete tasks faster for higher scores. Earn up to
                3 stars per level. Your points are added to the global leaderboard!
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full gold-gradient-bg text-black font-bold py-3 rounded-xl text-sm hover:brightness-110 transition-all"
            >
              Got it — Let&apos;s Play!
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
