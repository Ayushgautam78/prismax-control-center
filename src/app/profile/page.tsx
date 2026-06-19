"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  HiArrowLeft,
  HiUser,
  HiPencilSquare,
  HiCheck,
  HiSparkles,
  HiCheckCircle,
  HiClock,
  HiPlay,
  HiTrophy,
} from "react-icons/hi2";
import { useGameStore, useUserTitle } from "@/lib/store";
import { ACHIEVEMENTS } from "@/lib/data/achievements";
import { getFakeSessions } from "@/lib/data/sessions";
import { formatTime } from "@/lib/utils";

export default function ProfilePage() {
  const {
    userName,
    totalPoints,
    achievements: unlockedIds,
    sessionHistory,
    totalJointMoves,
    totalTrainingDataPoints,
    levelBestScores,
    setName,
  } = useGameStore();

  const userTitle = useUserTitle();
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(userName || "");
  const [activeTab, setActiveTab] = useState<"history" | "achievements">("history");

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setName(nameInput.trim());
      setIsEditing(false);
    }
  };

  // Combine real session history with some simulated sessions to look rich
  const simulatedHistory = getFakeSessions().slice(0, 10);
  const allHistory = [...sessionHistory, ...simulatedHistory];

  return (
    <div className="min-h-screen py-12 px-4">
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
              Operator{" "}
              <span className="bg-gradient-to-r from-[#C5974B] to-[#D4A853] bg-clip-text text-transparent">
                Profile
              </span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Your teleoperation credentials and records
            </p>
          </div>
        </motion.div>

        {/* Profile Card & Star Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Operator Identity Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 p-6 rounded-2xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/10 flex flex-col sm:flex-row gap-6 items-center"
          >
            {/* Avatar Badge */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#C5974B]/20 to-[#8B6914]/20 border border-[#C5974B]/30 flex items-center justify-center shadow-[0_0_30px_rgba(197,151,75,0.1)]">
                <HiUser className="w-12 h-12 text-[#C5974B]" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#C5974B] to-[#D4A853] text-black text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                {userTitle}
              </div>
            </div>

            {/* Name Editing / Display */}
            <div className="flex-1 w-full text-center sm:text-left">
              {isEditing ? (
                <div className="flex gap-2 max-w-sm mx-auto sm:mx-0">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-black/50 border border-[#C5974B]/30 text-white focus:outline-none focus:border-[#C5974B] text-sm"
                    placeholder="Enter operator name..."
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-2.5 rounded-xl bg-[#C5974B] text-black hover:bg-[#D4A853] transition-colors"
                  >
                    <HiCheck className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <h2 className="text-2xl font-bold text-white">
                    {userName || "Anonymous Operator"}
                  </h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-400 hover:text-[#C5974B] transition-colors"
                    aria-label="Edit name"
                  >
                    <HiPencilSquare className="w-5 h-5" />
                  </button>
                </div>
              )}
              <p className="text-gray-400 text-sm mt-1">
                Operator ID: PRISMAX-{totalJointMoves ? totalJointMoves + 1284 : "PENDING"}
              </p>
              
              {/* Quick Stats Summary */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
                <div className="text-center sm:text-left">
                  <span className="text-xs text-gray-500 uppercase tracking-wider block">Total Points</span>
                  <span className="text-lg font-bold text-[#C5974B]">{totalPoints.toLocaleString()}</span>
                </div>
                <div className="border-l border-white/5 h-8 hidden sm:block" />
                <div className="text-center sm:text-left">
                  <span className="text-xs text-gray-500 uppercase tracking-wider block">Joint Actions</span>
                  <span className="text-lg font-bold text-white">{totalJointMoves.toLocaleString()}</span>
                </div>
                <div className="border-l border-white/5 h-8 hidden sm:block" />
                <div className="text-center sm:text-left">
                  <span className="text-xs text-gray-500 uppercase tracking-wider block">Training Data</span>
                  <span className="text-lg font-bold text-[#D4A853]">{totalTrainingDataPoints.toLocaleString()} pts</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Level Star Cards */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/10 flex flex-col justify-between"
          >
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <HiTrophy className="text-[#C5974B]" />
              Level Completion
            </h3>
            
            <div className="space-y-3">
              {[1, 2, 3].map((lvl) => {
                const best = levelBestScores[lvl];
                return (
                  <div key={lvl} className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Level {lvl}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <span
                          key={s}
                          className={`text-base ${
                            best && s <= best.stars
                              ? "text-[#C5974B]"
                              : "text-gray-700"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-4 border-b border-white/5 mb-6">
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 text-sm font-bold tracking-wider uppercase border-b-2 transition-all ${
              activeTab === "history"
                ? "border-[#C5974B] text-[#C5974B]"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Session History
          </button>
          <button
            onClick={() => setActiveTab("achievements")}
            className={`pb-3 text-sm font-bold tracking-wider uppercase border-b-2 transition-all ${
              activeTab === "achievements"
                ? "border-[#C5974B] text-[#C5974B]"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Achievements
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "history" ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/10 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-gray-500 uppercase tracking-wider font-semibold bg-black/20">
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Level</th>
                    <th className="px-6 py-4">Points</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Precision</th>
                    <th className="px-6 py-4">Stars</th>
                    <th className="px-6 py-4">Training Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allHistory.map((session, idx) => {
                    const isReal = idx < sessionHistory.length;
                    return (
                      <tr
                        key={session.id}
                        className={`hover:bg-white/[0.01] transition-colors ${
                          isReal ? "bg-[#C5974B]/5 border-l-2 border-l-[#C5974B]" : ""
                        }`}
                      >
                        <td className="px-6 py-4 text-xs font-semibold">
                          {isReal ? (
                            <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                              Real
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-gray-500/10 text-gray-400">
                              Sim
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-white">
                          Level {session.level}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-[#C5974B]">
                          {session.pointsEarned.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {formatTime(session.duration)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {session.precision}%
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-0.5 text-xs">
                            {[1, 2, 3].map((star) => (
                              <span
                                key={star}
                                className={
                                  star <= session.stars
                                    ? "text-[#C5974B]"
                                    : "text-gray-700"
                                }
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          +{session.trainingDataPoints.toLocaleString()} points
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {ACHIEVEMENTS.map((ach) => {
              const isUnlocked = unlockedIds.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`p-6 rounded-2xl border transition-all duration-300 ${
                    isUnlocked
                      ? "bg-black/40 border-[#C5974B]/30 shadow-[0_0_20px_rgba(197,151,75,0.15)]"
                      : "bg-black/10 border-white/5 opacity-50"
                  }`}
                >
                  <div className="flex gap-4 items-start">
                    <span className="text-4xl">{ach.icon}</span>
                    <div>
                      <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                        {ach.name}
                        {isUnlocked && (
                          <HiCheckCircle className="w-5 h-5 text-green-400" />
                        )}
                      </h4>
                      <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                        {ach.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
