'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, type JointName } from '@/lib/store';
import { HiChevronUp, HiChevronDown, HiPlay, HiArrowPath } from 'react-icons/hi2';

interface JointControlPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

const JOINTS = [
  { key: 'baseRotation', label: 'Base', min: -180, max: 180, unit: '°', keys: 'A / D', step: 10 },
  { key: 'shoulderAngle', label: 'Shoulder', min: -90, max: 90, unit: '°', keys: 'W / S', step: 5 },
  { key: 'elbowAngle', label: 'Elbow', min: -135, max: 0, unit: '°', keys: 'Q / E', step: 5 },
  { key: 'wristPitch', label: 'Wrist Pitch', min: -90, max: 90, unit: '°', keys: 'Z / X', step: 5 },
  { key: 'wristRotation', label: 'Wrist Rot', min: -180, max: 180, unit: '°', keys: 'R / F', step: 10 },
  { key: 'gripperOpen', label: 'Gripper', min: 0, max: 100, unit: '%', keys: 'Space', step: 25 },
] as const;

const PRESET_POSES = [
  {
    name: 'Home',
    joints: { baseRotation: 0, shoulderAngle: 45, elbowAngle: -90, wristPitch: 0, wristRotation: 0 },
    tooltip: 'Default starting pose',
  },
  {
    name: 'Pick Ready',
    joints: { baseRotation: 45, shoulderAngle: 15, elbowAngle: -50, wristPitch: -20, wristRotation: 0 },
    tooltip: 'Low pose ready to grip objects',
  },
  {
    name: 'Carry',
    joints: { baseRotation: 0, shoulderAngle: 55, elbowAngle: -105, wristPitch: 20, wristRotation: 0 },
    tooltip: 'Elevated pose to carry objects safely',
  },
  {
    name: 'Drop Pose',
    joints: { baseRotation: -45, shoulderAngle: 30, elbowAngle: -70, wristPitch: 5, wristRotation: 0 },
    tooltip: 'Aligned over the drop zone',
  },
];

export default function JointControlPanel({ isOpen, onToggle }: JointControlPanelProps) {
  const store = useGameStore();

  const handleJog = (jointKey: JointName, amount: number) => {
    const currentValue = store[jointKey] as number;
    store.setJoint(jointKey, currentValue + amount);
  };

  const handleApplyPreset = (joints: Partial<typeof store.joints>) => {
    store.setJoints(joints);
  };

  return (
    <div className="absolute top-16 md:top-20 left-3 md:left-4 z-20 pointer-events-auto">
      <motion.button
        onClick={onToggle}
        className="glass rounded-xl px-3 py-2 flex items-center gap-2 mb-2 hover:border-[#C5974B]/40 transition-colors shadow-lg"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-[#C5974B] text-xs font-semibold uppercase tracking-wider">
          Joint Controls
        </span>
        {isOpen ? (
          <HiChevronUp className="text-[#C5974B]" />
        ) : (
          <HiChevronDown className="text-[#C5974B]" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="glass-strong rounded-xl p-3 md:p-4 w-[280px] md:w-[310px] overflow-hidden border border-white/5 shadow-2xl"
          >
            {/* Presets Grid */}
            <div className="mb-4">
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2 flex items-center gap-1">
                <HiPlay className="text-[#C5974B] text-[10px]" /> Pose Presets
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESET_POSES.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleApplyPreset(preset.joints)}
                    title={preset.tooltip}
                    className="glass text-[10px] text-[#C5974B] hover:text-white hover:bg-[#C5974B]/20 py-1.5 px-2 rounded-lg text-center transition-all truncate font-semibold active:scale-95"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider list */}
            <div className="space-y-3.5 border-t border-white/5 pt-3">
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider flex items-center gap-1">
                <HiArrowPath className="text-[#C5974B] text-[10px]" /> Fine Tuning (Jog/Slider)
              </div>
              {JOINTS.map((joint) => {
                const value = store[joint.key] as number;
                return (
                  <div key={joint.key} className="space-y-0.5">
                    <div className="flex justify-between items-center mb-0.5">
                      <label className="text-white/70 text-xs font-semibold">
                        {joint.label}
                      </label>
                      <div className="flex items-center gap-1">
                        <span className="text-[#D4A853] text-[11px] font-mono font-bold">
                          {Math.round(value)}{joint.unit}
                        </span>
                        <span className="text-white/30 text-[9px] hidden sm:inline">
                          [{joint.keys}]
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Jog Down Button */}
                      <button
                        onClick={() => handleJog(joint.key, -joint.step)}
                        className="w-6 h-6 rounded-lg bg-white/5 border border-white/5 text-white/60 hover:text-[#D4A853] hover:bg-[#C5974B]/20 hover:border-[#C5974B]/30 flex items-center justify-center font-bold text-sm active:scale-90 transition-all"
                      >
                        -
                      </button>

                      {/* Range Slider */}
                      <input
                        type="range"
                        min={joint.min}
                        max={joint.max}
                        value={value}
                        onChange={(e) =>
                          store.setJoint(joint.key, parseFloat(e.target.value))
                        }
                        className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer
                          [&::-webkit-slider-thumb]:appearance-none
                          [&::-webkit-slider-thumb]:w-3
                          [&::-webkit-slider-thumb]:h-3
                          [&::-webkit-slider-thumb]:rounded-full
                          [&::-webkit-slider-thumb]:bg-[#C5974B]
                          [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(197,151,75,0.5)]
                          [&::-webkit-slider-thumb]:cursor-pointer
                          [&::-webkit-slider-thumb]:transition-transform
                          [&::-webkit-slider-thumb]:hover:scale-125
                          [&::-moz-range-thumb]:w-3
                          [&::-moz-range-thumb]:h-3
                          [&::-moz-range-thumb]:rounded-full
                          [&::-moz-range-thumb]:bg-[#C5974B]
                          [&::-moz-range-thumb]:border-none
                          [&::-moz-range-thumb]:cursor-pointer"
                      />

                      {/* Jog Up Button */}
                      <button
                        onClick={() => handleJog(joint.key, joint.step)}
                        className="w-6 h-6 rounded-lg bg-white/5 border border-white/5 text-white/60 hover:text-[#D4A853] hover:bg-[#C5974B]/20 hover:border-[#C5974B]/30 flex items-center justify-center font-bold text-sm active:scale-90 transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
              <button
                onClick={() => store.resetJoints()}
                className="flex-1 glass rounded-lg py-1.5 text-xs text-[#C5974B] hover:bg-[#C5974B]/10 hover:text-white transition-all font-semibold active:scale-95"
              >
                Reset [H]
              </button>
              <button
                onClick={() => store.toggleGrip()}
                className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all active:scale-95 ${
                  store.isGripping
                    ? 'bg-[#C5974B] text-black shadow-[0_0_12px_rgba(197,151,75,0.4)]'
                    : 'glass text-[#C5974B] hover:bg-[#C5974B]/10 hover:text-white'
                }`}
              >
                {store.isGripping ? 'Release' : 'Grip'} [Space]
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
