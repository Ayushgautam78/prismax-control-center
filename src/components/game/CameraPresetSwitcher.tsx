'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HiCube, HiArrowDown, HiTv, HiArrowsRightLeft, HiMagnifyingGlass, HiEye } from 'react-icons/hi2';
import { useDeviceDetect } from '@/hooks/useDeviceDetect';

export type CameraPresetName = 'default' | 'top' | 'front' | 'side' | 'closeup' | 'gripper';

interface CameraPresetSwitcherProps {
  activePreset: CameraPresetName;
  onPresetChange: (preset: CameraPresetName) => void;
}

const PRESETS: { key: CameraPresetName; label: string; icon: React.ComponentType<any>; tooltip: string }[] = [
  { key: 'default', label: 'ISO', icon: HiCube, tooltip: 'Isometric 3D View' },
  { key: 'top', label: 'TOP', icon: HiArrowDown, tooltip: 'Top-Down Alignment View' },
  { key: 'front', label: 'FRONT', icon: HiTv, tooltip: 'Front Elevation View' },
  { key: 'side', label: 'SIDE', icon: HiArrowsRightLeft, tooltip: 'Side Profile View' },
  { key: 'closeup', label: 'ZOOM', icon: HiMagnifyingGlass, tooltip: 'Close-Up Gripper View' },
  { key: 'gripper', label: 'HAND', icon: HiEye, tooltip: 'First-Person Gripper Hand Cam' },
];

export default function CameraPresetSwitcher({ activePreset, onPresetChange }: CameraPresetSwitcherProps) {
  const { isMobile } = useDeviceDetect();

  if (isMobile) {
    return (
      <div className="absolute top-[68px] left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex flex-row gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/5 shadow-lg select-none">
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isActive = activePreset === preset.key;
          return (
            <motion.button
              key={preset.key}
              whileTap={{ scale: 0.92 }}
              onClick={() => onPresetChange(preset.key)}
              className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center border transition-all select-none cursor-pointer ${
                isActive
                  ? 'bg-[#C5974B]/20 border-[#C5974B] text-[#D4A853] shadow-[0_0_8px_rgba(197,151,75,0.25)]'
                  : 'bg-white/5 border-transparent text-white/50'
              }`}
            >
              <Icon className="text-sm select-none animate-none" />
              <span className="text-[7px] font-bold tracking-tight select-none">{preset.label}</span>
            </motion.button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-auto flex flex-col gap-2.5 select-none">
      <div className="glass-strong rounded-2xl p-2 flex flex-col gap-2 border border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.4)] select-none">
        <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest text-center mb-1 select-none">
          Camera
        </div>
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isActive = activePreset === preset.key;
          return (
            <div key={preset.key} className="group relative flex items-center select-none">
              {/* Tooltip */}
              <div className="absolute right-full mr-3 px-2.5 py-1.5 rounded-lg bg-black/90 border border-white/10 text-white text-[11px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 shadow-xl select-none">
                {preset.tooltip}
              </div>

              {/* Button */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => onPresetChange(preset.key)}
                className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all duration-300 select-none cursor-pointer ${
                  isActive
                    ? 'bg-[#C5974B]/20 border-[#C5974B] text-[#D4A853] shadow-[0_0_12px_rgba(197,151,75,0.25)]'
                    : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/10'
                }`}
              >
                <Icon className="text-base select-none" />
                <span className="text-[8px] font-bold tracking-tight select-none">{preset.label}</span>
              </motion.button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

