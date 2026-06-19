"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  HiArrowLeft,
  HiCpuChip,
  HiSignal,
  HiClock,
  HiTrophy,
} from "react-icons/hi2";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useGameStore } from "@/lib/store";
import { getFakeSessions } from "@/lib/data/sessions";

export default function StatisticsPage() {
  const { sessionHistory, totalPoints, totalTrainingDataPoints } = useGameStore();

  // Combine real user sessions with fake ones to populate a beautiful graph
  const statsData = useMemo(() => {
    const fake = getFakeSessions().slice(0, 15).reverse();
    const real = [...sessionHistory].reverse();
    return [...fake, ...real];
  }, [sessionHistory]);

  // Calculations for KPI Cards
  const kpis = useMemo(() => {
    if (statsData.length === 0) {
      return {
        avgPrecision: 0,
        totalHours: 0,
        completedCount: 0,
        topScore: 0,
      };
    }
    const sumPrec = statsData.reduce((acc, s) => acc + s.precision, 0);
    const sumDuration = statsData.reduce((acc, s) => acc + s.duration, 0);
    const topScore = statsData.reduce((max, s) => (s.pointsEarned > max ? s.pointsEarned : max), 0);

    return {
      avgPrecision: Math.round(sumPrec / statsData.length),
      totalHours: (sumDuration / 3600).toFixed(1),
      completedCount: statsData.length,
      topScore,
    };
  }, [statsData]);

  // Data for Level Distribution Chart
  const levelDistribution = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0 };
    statsData.forEach((s) => {
      if (s.level === 1 || s.level === 2 || s.level === 3) {
        counts[s.level] += 1;
      }
    });

    return [
      { name: "Lvl 1: Pick & Place", value: counts[1], fill: "#C5974B" },
      { name: "Lvl 2: Multi-Object", value: counts[2], fill: "#D4A853" },
      { name: "Lvl 3: Color Sorting", value: counts[3], fill: "#8B6914" },
    ].filter((item) => item.value > 0);
  }, [statsData]);

  // Data for Cumulative Training Data Points
  const trainingDataChart = useMemo(() => {
    let cumulative = 0;
    return statsData.map((s, idx) => {
      cumulative += s.trainingDataPoints;
      return {
        session: `S-${idx + 1}`,
        points: s.trainingDataPoints,
        cumulative,
      };
    });
  }, [statsData]);

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
                Analytics
              </span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Performance metrics and AI training progress
            </p>
          </div>
        </motion.div>

        {/* KPI Dashboard Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Average Precision */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-2xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/10 text-center"
          >
            <HiSignal className="w-6 h-6 text-[#C5974B] mx-auto mb-2" />
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Avg Precision
            </p>
            <p className="text-2xl font-bold text-white">
              {kpis.avgPrecision}%
            </p>
          </motion.div>

          {/* Sessions Completed */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-5 rounded-2xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/10 text-center"
          >
            <HiCpuChip className="w-6 h-6 text-[#C5974B] mx-auto mb-2" />
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Sessions Completed
            </p>
            <p className="text-2xl font-bold text-white">
              {kpis.completedCount}
            </p>
          </motion.div>

          {/* Time Online */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-5 rounded-2xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/10 text-center"
          >
            <HiClock className="w-6 h-6 text-[#C5974B] mx-auto mb-2" />
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Time Online
            </p>
            <p className="text-2xl font-bold text-white">
              {kpis.totalHours} hrs
            </p>
          </motion.div>

          {/* Top Session Score */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-5 rounded-2xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/10 text-center"
          >
            <HiTrophy className="w-6 h-6 text-[#C5974B] mx-auto mb-2" />
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Top Session Score
            </p>
            <p className="text-2xl font-bold text-[#C5974B]">
              {kpis.topScore.toLocaleString()}
            </p>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Chart 1: Precision Trend */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/10"
          >
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4">
              Precision Trend (%)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statsData}>
                  <XAxis dataKey="id" hide />
                  <YAxis domain={[50, 100]} stroke="#666" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111", borderColor: "#C5974B" }}
                    labelFormatter={() => "Teleop Performance"}
                  />
                  <Line
                    type="monotone"
                    dataKey="precision"
                    stroke="#C5974B"
                    strokeWidth={2}
                    dot={{ fill: "#D4A853" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Chart 2: Cumulative Training Data */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 rounded-2xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/10"
          >
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4">
              Training Data Collection Growth
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trainingDataChart}>
                  <XAxis dataKey="session" stroke="#666" fontSize={10} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: "#111", borderColor: "#C5974B" }} />
                  <defs>
                    <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C5974B" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#C5974B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#C5974B"
                    fillOpacity={1}
                    fill="url(#colorCumulative)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Chart 3: Level Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-6 rounded-2xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/10 flex flex-col md:flex-row items-center gap-6"
          >
            <div className="flex-1 w-full">
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4">
                Completed Mission Mix
              </h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={levelDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {levelDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#111", borderColor: "#C5974B" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Pie Legend */}
            <div className="space-y-3 w-full md:w-auto">
              {levelDistribution.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.fill }} />
                  <span className="text-xs text-gray-300 whitespace-nowrap">
                    {entry.name} ({entry.value})
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Chart 4: Time Taken Trend */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="p-6 rounded-2xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/10"
          >
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-4">
              Session Duration (seconds)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData.slice(-10)}>
                  <XAxis dataKey="id" hide />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111", borderColor: "#C5974B" }}
                    labelFormatter={() => "Duration Details"}
                  />
                  <Bar dataKey="duration" fill="#D4A853" radius={[4, 4, 0, 0]}>
                    {statsData.slice(-10).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.level === 3 ? "#8B6914" : entry.level === 2 ? "#D4A853" : "#C5974B"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
