"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useInView } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useGameStore, type SessionReport } from "@/lib/store";
import { getAchievements } from "@/lib/data/achievements";
import { formatDuration, getLevelTitle } from "@/lib/utils";

// ─── Animated Number ────────────────────────────────────────────────────────
function AnimatedNumber({
  target,
  suffix = "",
  decimals = 0,
}: {
  target: number;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = target / 90;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(start);
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Circular Progress ──────────────────────────────────────────────────────
function CircularProgress({
  value,
  size = 100,
  strokeWidth = 8,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const [progress, setProgress] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setProgress(value), 100);
      return () => clearTimeout(timer);
    }
  }, [isInView, value]);

  return (
    <div ref={ref} className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(197,151,75,0.1)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={
            circumference - (progress / 100) * circumference
          }
          style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
        />
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C5974B" />
            <stop offset="100%" stopColor="#D4A853" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <span className="text-xl font-bold text-[#C5974B]">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}

// ─── Report Page ────────────────────────────────────────────────────────────
export default function ReportPage() {
  const router = useRouter();
  const report = useGameStore((s) => s.lastSessionReport);
  const achievements = useGameStore((s) => s.achievements);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !report) {
      router.push("/play");
    }
  }, [mounted, report, router]);

  if (!mounted || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C5974B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const r: SessionReport = report;

  const chartData = [
    { name: "Precision", value: r.precisionScore, fill: "#C5974B" },
    { name: "Smoothness", value: r.motionSmoothness, fill: "#D4A853" },
    { name: "AI Quality", value: r.aiQualityScore, fill: "#8B6914" },
    { name: "Speed", value: Math.min(100, (60 / r.completionTime) * 100), fill: "#916E2B" },
  ];

  const unlockedAchievements = r.achievementsUnlocked
    .map((id) => getAchievements([id]).find((a) => a.id === id))
    .filter(Boolean);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Stars */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            {[1, 2, 3].map((star) => (
              <motion.span
                key={star}
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{
                  opacity: 1,
                  scale: star <= r.stars ? 1 : 0.5,
                  rotate: 0,
                }}
                transition={{
                  delay: 0.3 + star * 0.2,
                  duration: 0.5,
                  type: "spring",
                }}
                className={`text-5xl sm:text-6xl ${
                  star <= r.stars ? "text-[#C5974B] drop-shadow-[0_0_15px_rgba(197,151,75,0.5)]" : "text-gray-700"
                }`}
              >
                ★
              </motion.span>
            ))}
          </div>

          {/* Level badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C5974B]/10 border border-[#C5974B]/20"
          >
            <span className="text-sm text-[#D4A853] font-medium">
              Level {r.level} — {getLevelTitle(r.level)} Complete
            </span>
          </motion.div>
        </motion.div>

        {/* Stat Cards Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8"
        >
          {/* Completion Time */}
          <div className="p-5 rounded-2xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/10 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Time
            </p>
            <p className="text-2xl font-bold text-white">
              {formatDuration(r.completionTime)}
            </p>
          </div>

          {/* Objects Placed */}
          <div className="p-5 rounded-2xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/10 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Objects
            </p>
            <p className="text-2xl font-bold text-white">
              {r.objectsPlaced}/{r.totalObjects}
            </p>
          </div>

          {/* Precision Score */}
          <div className="p-5 rounded-2xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/10 flex flex-col items-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Precision
            </p>
            <CircularProgress value={r.precisionScore} size={80} />
          </div>

          {/* Smoothness */}
          <div className="p-5 rounded-2xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/10 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Smoothness
            </p>
            <div className="mt-3">
              <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${r.motionSmoothness}%` }}
                  transition={{ delay: 1, duration: 1.5 }}
                  className="h-full rounded-full bg-gradient-to-r from-[#C5974B] to-[#D4A853]"
                />
              </div>
              <p className="text-sm text-[#D4A853] font-bold mt-2">
                <AnimatedNumber target={r.motionSmoothness} suffix="%" decimals={1} />
              </p>
            </div>
          </div>

          {/* Training Points */}
          <div className="p-5 rounded-2xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/10 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Data Points
            </p>
            <p className="text-2xl font-bold text-[#D4A853]">
              <AnimatedNumber target={r.trainingDataPoints} />
            </p>
          </div>

          {/* AI Quality */}
          <div className="p-5 rounded-2xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/10 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              AI Quality
            </p>
            <p className="text-2xl font-bold text-[#C5974B]">
              <AnimatedNumber target={r.aiQualityScore} suffix="%" decimals={1} />
            </p>
          </div>

          {/* Total Points */}
          <div className="col-span-2 p-5 rounded-2xl bg-gradient-to-br from-[#C5974B]/10 to-[#8B6914]/10 backdrop-blur-xl border border-[#C5974B]/20 text-center shadow-[0_0_30px_rgba(197,151,75,0.1)]">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Total Points Earned
            </p>
            <p className="text-4xl font-bold bg-gradient-to-r from-[#C5974B] to-[#D4A853] bg-clip-text text-transparent">
              <AnimatedNumber target={r.totalPoints} />
            </p>
          </div>
        </motion.div>

        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="p-6 rounded-2xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/10 mb-8"
        >
          <h3 className="text-lg font-bold text-white mb-4">
            Performance Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111111",
                    border: "1px solid rgba(197,151,75,0.2)",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Achievement Unlocks */}
        {unlockedAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mb-8"
          >
            <h3 className="text-lg font-bold text-white mb-4">
              🏆 Achievements Unlocked!
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {unlockedAchievements.map(
                (ach) =>
                  ach && (
                    <motion.div
                      key={ach.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.2, type: "spring" }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-[#C5974B]/10 border border-[#C5974B]/20 shadow-[0_0_20px_rgba(197,151,75,0.15)]"
                    >
                      <span className="text-3xl">{ach.icon}</span>
                      <div>
                        <p className="font-bold text-[#C5974B]">{ach.name}</p>
                        <p className="text-sm text-gray-400">
                          {ach.description}
                        </p>
                      </div>
                    </motion.div>
                  )
              )}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          {r.level < 3 && (
            <Link href={`/play/${r.level + 1}`} className="flex-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#C5974B] to-[#D4A853] text-black font-bold text-sm hover:shadow-[0_0_30px_rgba(197,151,75,0.3)] transition-shadow"
              >
                Next Level →
              </motion.button>
            </Link>
          )}
          <Link href={`/play/${r.level}`} className="flex-1">
            <button className="w-full py-3.5 rounded-xl bg-black/30 border border-[#C5974B]/20 text-[#C5974B] font-bold text-sm hover:border-[#C5974B]/40 transition-all">
              Retry Level
            </button>
          </Link>
          <Link href="/play" className="flex-1">
            <button className="w-full py-3.5 rounded-xl bg-black/30 border border-white/10 text-gray-400 font-bold text-sm hover:border-white/20 transition-all">
              Back to Menu
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
