"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HiArrowLeft, HiMagnifyingGlass, HiArrowRight } from "react-icons/hi2";
import { getLeaderboard, getUserRank } from "@/lib/data/leaderboard";
import { useGameStore } from "@/lib/store";

const podiumColors = [
  {
    bg: "from-yellow-500/20 to-yellow-900/10",
    border: "border-yellow-500/30",
    text: "text-yellow-400",
    glow: "shadow-[0_0_30px_rgba(234,179,8,0.2)]",
    medal: "🥇",
  },
  {
    bg: "from-gray-300/20 to-gray-600/10",
    border: "border-gray-400/30",
    text: "text-gray-300",
    glow: "shadow-[0_0_20px_rgba(156,163,175,0.15)]",
    medal: "🥈",
  },
  {
    bg: "from-amber-700/20 to-amber-900/10",
    border: "border-amber-700/30",
    text: "text-amber-600",
    glow: "shadow-[0_0_20px_rgba(180,83,9,0.15)]",
    medal: "🥉",
  },
];

export default function LeaderboardPage() {
  const [search, setSearch] = useState("");
  const userName = useGameStore((s) => s.userName);
  const totalPoints = useGameStore((s) => s.totalPoints);
  const lastSessionReport = useGameStore((s) => s.lastSessionReport);
  const leaderboard = useMemo(() => getLeaderboard(userName, totalPoints), [userName, totalPoints]);
  const userRank = useMemo(() => getUserRank(totalPoints), [totalPoints]);

  const filtered = useMemo(() => {
    if (!search) return leaderboard;
    return leaderboard.filter((e) =>
      e.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [leaderboard, search]);

  const top3 = leaderboard.slice(0, 3);

  return (
    <div className="min-h-screen py-12 px-4 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link
            href="/"
            className="p-2 rounded-xl bg-black/30 border border-white/10 hover:border-[#C5974B]/30 transition-all text-gray-400 hover:text-[#C5974B]"
          >
            <HiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Global{" "}
              <span className="bg-gradient-to-r from-[#C5974B] to-[#D4A853] bg-clip-text text-transparent">
                Leaderboard
              </span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Top operators worldwide
            </p>
          </div>
        </motion.div>

        {/* Your Rank */}
        {userName && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-[#C5974B]/10 to-[#8B6914]/10 border border-[#C5974B]/20 shadow-[0_0_30px_rgba(197,151,75,0.1)]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C5974B] to-[#8B6914] flex items-center justify-center font-bold text-black">
                  #{userRank}
                </div>
                <div>
                  <p className="font-bold text-white">{userName}</p>
                  <p className="text-sm text-gray-400">Your Position</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#C5974B]">
                  {totalPoints.toLocaleString()} pts
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Podium */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        >
          {/* Display order: 2nd, 1st, 3rd for podium effect */}
          {[top3[1], top3[0], top3[2]].map((entry, i) => {
            const colorIdx = i === 1 ? 0 : i === 0 ? 1 : 2;
            const colors = podiumColors[colorIdx];
            if (!entry) return null;
            return (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className={`relative p-6 rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border} ${colors.glow} ${
                  i === 1 ? "sm:-mt-4 sm:mb-4" : ""
                }`}
              >
                <div className="text-center">
                  <span className="text-4xl mb-2 block">{colors.medal}</span>
                  <p className={`text-xl font-bold ${colors.text}`}>
                    {entry.name}
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {entry.totalPoints.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">points</p>
                  <div className="flex items-center justify-center gap-3 mt-3 text-xs text-gray-400">
                    <span>⏱ {entry.bestTime}</span>
                    <span>🎯 {entry.accuracy}%</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <div className="relative">
            <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search operators..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:border-[#C5974B]/30 text-white placeholder-gray-500 focus:outline-none transition-all text-sm"
            />
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/10 overflow-hidden"
        >
          {/* Header */}
          <div className="hidden sm:grid grid-cols-8 gap-4 px-6 py-3 border-b border-white/5 text-xs text-gray-500 uppercase tracking-wider font-semibold">
            <span>Rank</span>
            <span className="col-span-2">Operator</span>
            <span>Points</span>
            <span>Levels</span>
            <span>Best Time</span>
            <span>Accuracy</span>
            <span>Badge</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/5">
            {filtered.map((entry) => {
              const isUser =
                userName &&
                entry.name.toLowerCase() === userName.toLowerCase();
              return (
                <div
                  key={entry.rank}
                  className={`grid grid-cols-2 sm:grid-cols-8 gap-2 sm:gap-4 px-6 py-4 items-center transition-colors ${
                    isUser
                      ? "bg-[#C5974B]/5 border-l-2 border-l-[#C5974B]"
                      : "hover:bg-white/[0.02]"
                  }`}
                >
                  <span
                    className={`font-bold ${
                      entry.rank <= 3 ? "text-[#C5974B]" : "text-gray-500"
                    }`}
                  >
                    #{entry.rank}
                  </span>
                  <span className="col-span-1 sm:col-span-2 font-medium text-white truncate">
                    {entry.name}
                    {isUser && (
                      <span className="ml-2 text-xs text-[#C5974B]">
                        (You)
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-gray-300 hidden sm:block">
                    {entry.totalPoints.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-400 hidden sm:block">
                    {entry.levelsCompleted}/3
                  </span>
                  <span className="text-sm text-gray-400 hidden sm:block">
                    {entry.bestTime}
                  </span>
                  <span className="text-sm text-gray-400 hidden sm:block">
                    {entry.accuracy}%
                  </span>
                  <span className="text-lg hidden sm:block">
                    {entry.badge}
                  </span>

                  {/* Mobile info */}
                  <div className="col-span-2 sm:hidden flex items-center gap-4 text-xs text-gray-500">
                    <span>{entry.totalPoints.toLocaleString()} pts</span>
                    <span>{entry.accuracy}%</span>
                    <span>{entry.badge}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">
              No operators found matching &quot;{search}&quot;
            </div>
          )}
        </motion.div>
      </div>

      {/* Floating Sticky Continue Banner */}
      {lastSessionReport && lastSessionReport.level < 3 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/85 backdrop-blur-md border-t border-[#C5974B]/20 flex items-center justify-between z-30 shadow-2xl">
          <div className="text-left ml-2">
            <p className="text-[10px] uppercase tracking-widest text-[#D4A853] font-bold">Training In Progress</p>
            <p className="text-xs text-white/70">
              Level {lastSessionReport.level} completed. Ready for Level {lastSessionReport.level + 1}?
            </p>
          </div>
          <Link
            href={`/play/${lastSessionReport.level + 1}`}
            className="gold-gradient-bg text-black px-4 py-2.5 rounded-xl font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[#C5974B]/20 flex items-center gap-1.5 mr-2"
          >
            Start Level {lastSessionReport.level + 1}
            <HiArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
