"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HiArrowLeft, HiClock, HiTrophy } from "react-icons/hi2";
import { useGameStore } from "@/lib/store";
import { getFakeSessions } from "@/lib/data/sessions";
import { formatTime, getLevelTitle } from "@/lib/utils";

export default function SessionsPage() {
  const sessionHistory = useGameStore((s) => s.sessionHistory);

  // Combine real sessions with simulated sessions
  const simulatedHistory = useMemo(() => getFakeSessions(), []);
  const allSessions = useMemo(
    () => [...sessionHistory, ...simulatedHistory],
    [sessionHistory, simulatedHistory]
  );

  const totalRealPoints = useMemo(
    () => sessionHistory.reduce((sum, s) => sum + s.pointsEarned, 0),
    [sessionHistory]
  );

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
              Session{" "}
              <span className="bg-gradient-to-r from-[#C5974B] to-[#D4A853] bg-clip-text text-transparent">
                History
              </span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Your teleoperation session records
            </p>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          <div className="p-4 rounded-xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/10 text-center">
            <HiClock className="w-5 h-5 text-[#C5974B] mx-auto mb-1" />
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              Real Sessions
            </p>
            <p className="text-xl font-bold text-white mt-1">
              {sessionHistory.length}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/10 text-center">
            <HiTrophy className="w-5 h-5 text-[#C5974B] mx-auto mb-1" />
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              Real Points
            </p>
            <p className="text-xl font-bold text-[#C5974B] mt-1">
              {totalRealPoints.toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/10 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              Total Records
            </p>
            <p className="text-xl font-bold text-white mt-1">
              {allSessions.length}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/10 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider">
              Avg Precision
            </p>
            <p className="text-xl font-bold text-white mt-1">
              {allSessions.length > 0
                ? Math.round(
                    allSessions.reduce((s, r) => s + r.precision, 0) /
                      allSessions.length
                  )
                : 0}
              %
            </p>
          </div>
        </motion.div>

        {/* Sessions Table */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/10 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-xs text-gray-500 uppercase tracking-wider font-semibold bg-black/20">
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Level</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Precision</th>
                  <th className="px-6 py-4">Points</th>
                  <th className="px-6 py-4">Stars</th>
                  <th className="px-6 py-4">Training Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {allSessions.map((session, idx) => {
                  const isReal = idx < sessionHistory.length;
                  const date = new Date(session.date);
                  return (
                    <tr
                      key={session.id}
                      className={`hover:bg-white/[0.01] transition-colors ${
                        isReal
                          ? "bg-[#C5974B]/5 border-l-2 border-l-[#C5974B]"
                          : ""
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
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        <span className="font-medium">
                          Level {session.level}
                        </span>
                        <span className="text-gray-500 text-xs ml-1.5 hidden sm:inline">
                          {getLevelTitle(session.level)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300 font-mono">
                        {formatTime(session.duration)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={
                            session.precision >= 90
                              ? "text-green-400"
                              : session.precision >= 75
                              ? "text-[#D4A853]"
                              : "text-gray-400"
                          }
                        >
                          {session.precision}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-[#C5974B]">
                        {session.pointsEarned.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-0.5 text-sm">
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
                        +{session.trainingDataPoints.toLocaleString()} pts
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {allSessions.length === 0 && (
            <div className="px-6 py-16 text-center">
              <p className="text-gray-500 mb-4">
                No sessions recorded yet. Start playing to see your history!
              </p>
              <Link
                href="/play"
                className="inline-flex px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C5974B] to-[#8B6914] text-black font-semibold text-sm hover:shadow-[0_0_30px_rgba(197,151,75,0.3)] transition-shadow"
              >
                Start Playing
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
