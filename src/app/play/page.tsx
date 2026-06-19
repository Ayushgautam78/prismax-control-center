"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { HiArrowLeft, HiInformationCircle, HiXMark } from "react-icons/hi2";
import { TbKeyboard } from "react-icons/tb";
import { useGameStore } from "@/lib/store";

const levels = [
  {
    id: 1,
    title: "Single Pick & Place",
    difficulty: "Beginner",
    icon: "📦",
    objects: "1 object, 1 box",
    description:
      "Learn the basics. Pick up a single object and place it in the target zone. Perfect for first-time operators.",
    color: "from-green-500/20 to-green-900/20",
    borderColor: "border-green-500/20 hover:border-green-500/40",
    badgeColor: "bg-green-500/20 text-green-400",
  },
  {
    id: 2,
    title: "Multi-Object Handling",
    difficulty: "Intermediate",
    icon: "📦📦",
    objects: "2 objects, 1 box",
    description:
      "Handle multiple objects in sequence. Manage your time and precision across consecutive pick & place operations.",
    color: "from-[#C5974B]/20 to-[#8B6914]/20",
    borderColor: "border-[#C5974B]/20 hover:border-[#C5974B]/40",
    badgeColor: "bg-[#C5974B]/20 text-[#C5974B]",
  },
  {
    id: 3,
    title: "Color Sorting",
    difficulty: "Advanced",
    icon: "🎨",
    objects: "3 colored objects, 3 boxes",
    description:
      "The ultimate challenge. Sort colored objects into their matching colored boxes. Requires strategy and speed.",
    color: "from-red-500/20 to-purple-900/20",
    borderColor: "border-red-500/20 hover:border-red-500/40",
    badgeColor: "bg-red-500/20 text-red-400",
  },
];

const controls = [
  { key: "A / D", action: "Base Rotation" },
  { key: "W / S", action: "Shoulder Up / Down" },
  { key: "Q / E", action: "Elbow Up / Down" },
  { key: "Z / X", action: "Wrist Pitch" },
  { key: "R / F", action: "Wrist Rotation" },
  { key: "Space", action: "Toggle Gripper" },
  { key: "Shift", action: "Speed Boost (hold)" },
  { key: "H", action: "Home / Reset" },
];

export default function PlayPage() {
  const [showInstructions, setShowInstructions] = useState(false);
  const levelBestScores = useGameStore((s) => s.levelBestScores);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-12"
        >
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-xl bg-black/30 border border-white/10 hover:border-[#C5974B]/30 transition-all text-gray-400 hover:text-[#C5974B]"
            >
              <HiArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Select{" "}
                <span className="bg-gradient-to-r from-[#C5974B] to-[#D4A853] bg-clip-text text-transparent">
                  Mission
                </span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Choose your challenge level
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowInstructions(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/30 border border-[#C5974B]/20 hover:border-[#C5974B]/40 text-[#C5974B] text-sm font-medium transition-all hover:shadow-[0_0_20px_rgba(197,151,75,0.1)]"
          >
            <HiInformationCircle className="w-5 h-5" />
            <span className="hidden sm:inline">How to Play</span>
          </button>
        </motion.div>

        {/* Level Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {levels.map((level, i) => {
            const best = levelBestScores[level.id];
            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className={`group relative rounded-2xl bg-gradient-to-br ${level.color} backdrop-blur-xl border ${level.borderColor} transition-all duration-300 overflow-hidden`}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative p-6 sm:p-8">
                  {/* Icon & Level */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="text-5xl">{level.icon}</div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${level.badgeColor}`}
                    >
                      {level.difficulty}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-white mb-2">
                    Level {level.id}: {level.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-2">{level.objects}</p>
                  <p className="text-sm text-gray-500 leading-relaxed mb-6">
                    {level.description}
                  </p>

                  {/* Best Score */}
                  {best && (
                    <div className="mb-6 p-3 rounded-xl bg-black/30 border border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">
                          Best Score
                        </span>
                        <span className="text-sm font-bold text-[#C5974B]">
                          {best.score.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3].map((s) => (
                          <span
                            key={s}
                            className={`text-lg ${
                              s <= best.stars
                                ? "text-[#C5974B]"
                                : "text-gray-700"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Start Button */}
                  <Link href={`/play/${level.id}`}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C5974B] to-[#8B6914] text-black font-bold text-sm hover:shadow-[0_0_30px_rgba(197,151,75,0.3)] transition-shadow"
                    >
                      Start Mission
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {[
            { label: "Total Levels", value: "3" },
            { label: "Max Stars", value: "9" },
            { label: "Objects", value: "6" },
            { label: "Difficulty Range", value: "Easy → Hard" },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-black/20 border border-white/5 text-center"
            >
              <div className="text-lg font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ─── Instructions Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowInstructions(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-[#111111] border border-[#C5974B]/20 shadow-[0_0_60px_rgba(197,151,75,0.15)] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <TbKeyboard className="w-5 h-5 text-[#C5974B]" />
                  <h3 className="text-lg font-bold text-white">
                    How to Play
                  </h3>
                </div>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                >
                  <HiXMark className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="px-6 py-5 space-y-6">
                {/* PC Controls */}
                <div>
                  <h4 className="text-sm font-semibold text-[#C5974B] uppercase tracking-wider mb-3">
                    Keyboard Controls (PC)
                  </h4>
                  <div className="space-y-2">
                    {controls.map((ctrl, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-black/30 border border-white/5"
                      >
                        <span className="text-sm text-gray-300">
                          {ctrl.action}
                        </span>
                        <div className="flex gap-1">
                          {ctrl.key.split(" / ").map((k, j) => (
                            <span key={j}>
                              <kbd className="px-2 py-1 rounded bg-white/10 text-xs font-mono text-[#D4A853] border border-white/10">
                                {k}
                              </kbd>
                              {j < ctrl.key.split(" / ").length - 1 && (
                                <span className="text-gray-600 mx-1">/</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile Controls */}
                <div>
                  <h4 className="text-sm font-semibold text-[#C5974B] uppercase tracking-wider mb-3">
                    Mobile Controls
                  </h4>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    On mobile devices, use the on-screen joysticks and slider
                    controls. The left joystick controls base rotation and
                    shoulder angle. The right joystick handles elbow and wrist
                    movements. Tap the gripper button to toggle open/close.
                  </p>
                </div>

                {/* Objective */}
                <div>
                  <h4 className="text-sm font-semibold text-[#C5974B] uppercase tracking-wider mb-3">
                    Objective
                  </h4>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Move the robotic arm to pick up objects and place them in
                    the designated target zones. You&apos;re scored on precision,
                    speed, and motion smoothness. Complete all object placements
                    to finish the level.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-white/5">
                <button
                  onClick={() => setShowInstructions(false)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C5974B] to-[#8B6914] text-black font-semibold text-sm"
                >
                  Got It!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
