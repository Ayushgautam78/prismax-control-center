'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeviceDetect } from '@/hooks/useDeviceDetect';

interface ControlHintsProps {
  isHoldingObject: boolean;
  nearObject: boolean;
  nearBox: boolean;
  isGripping: boolean;
  objectsPlaced: number;
  totalObjects: number;
}

const HINT_STYLES = "inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 text-[#D4A853] font-mono text-[11px] font-bold border border-white/5";

export default function ControlHints({
  isHoldingObject,
  nearObject,
  nearBox,
  isGripping,
  objectsPlaced,
  totalObjects,
}: ControlHintsProps) {
  const { isMobile } = useDeviceDetect();

  // Determine the current hint based on game state
  let hintIcon = '🎮';
  let hintTitle = '';
  let hintBody = '';
  let hintKeys: { key: string; action: string }[] = [];
  let priority: 'normal' | 'action' | 'success' = 'normal';

  if (objectsPlaced >= totalObjects) {
    hintIcon = '🎉';
    hintTitle = 'Level Complete!';
    hintBody = 'All objects placed. Session ending...';
    priority = 'success';
  } else if (isHoldingObject && nearBox) {
    hintIcon = '📦';
    hintTitle = 'Drop the object!';
    hintBody = 'You\'re over a box — release to place the object';
    hintKeys = isMobile
      ? [{ key: 'GRIP btn', action: 'Release object' }]
      : [{ key: 'Space', action: 'Release & place object' }];
    priority = 'action';
  } else if (isHoldingObject) {
    hintIcon = '🦾';
    hintTitle = 'Object gripped!';
    hintBody = 'Move the arm over a target box';
    hintKeys = isMobile
      ? [{ key: 'D-Pad', action: 'Move arm' }, { key: 'Tabs', action: 'Switch joint' }]
      : [
          { key: 'A/D', action: 'Rotate base' },
          { key: 'W/S', action: 'Shoulder' },
          { key: 'Q/E', action: 'Elbow' },
        ];
    priority = 'normal';
  } else if (nearObject && !isGripping) {
    hintIcon = '✋';
    hintTitle = 'Object in range!';
    hintBody = 'Close the gripper to pick it up';
    hintKeys = isMobile
      ? [{ key: 'GRIP btn', action: 'Grab object' }]
      : [{ key: 'Space', action: 'Grip object' }];
    priority = 'action';
  } else {
    hintIcon = '🤖';
    hintTitle = 'Move to an object';
    hintBody = 'Position the gripper near a colored cube';
    hintKeys = isMobile
      ? [
          { key: 'D-Pad', action: 'Move' },
          { key: 'Tabs', action: 'Switch joint' },
          { key: 'GRIP', action: 'Grab' },
        ]
      : [
          { key: 'A/D', action: 'Base' },
          { key: 'W/S', action: 'Shoulder' },
          { key: 'Q/E', action: 'Elbow' },
          { key: 'Z/X', action: 'Wrist' },
          { key: 'Space', action: 'Grip' },
          { key: 'Shift', action: 'Fast' },
        ];
    priority = 'normal';
  }

  const borderColor =
    priority === 'action'
      ? 'border-[#C5974B]/40 shadow-[0_0_15px_rgba(197,151,75,0.15)]'
      : priority === 'success'
      ? 'border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
      : 'border-white/5';

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
      className={`absolute bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none max-w-xl w-[95%]`}
    >
      <div
        className={`glass rounded-xl px-4 py-2.5 flex items-center gap-3 border transition-all duration-300 ${borderColor}`}
      >
        {/* Icon */}
        <span className="text-xl flex-shrink-0">{hintIcon}</span>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white text-xs font-bold">{hintTitle}</span>
            <span className="text-white/40 text-[11px] hidden sm:inline">{hintBody}</span>
          </div>
        </div>

        {/* Key hints */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <AnimatePresence mode="popLayout">
            {hintKeys.map((k) => (
              <motion.div
                key={k.key}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center"
              >
                <kbd className={HINT_STYLES}>{k.key}</kbd>
                <span className="text-[9px] text-white/30 mt-0.5 hidden md:block">{k.action}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
