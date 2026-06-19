"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  HiCpuChip,
  HiTrophy,
  HiAcademicCap,
  HiSignal,
  HiGlobeAlt,
} from "react-icons/hi2";
import { useGameStore } from "@/lib/store";

// ─── Animated Counter ───────────────────────────────────────────────────────
function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  duration = 2,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = target;
    const step = end / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

// ─── Feature Card ───────────────────────────────────────────────────────────
const features = [
  {
    icon: HiCpuChip,
    title: "Teleoperation",
    description:
      "Control a 6-DOF robotic arm in real-time with keyboard or touch controls. Every joint responds instantly.",
  },
  {
    icon: HiAcademicCap,
    title: "Training Data Generation",
    description:
      "Your movements generate high-quality training data for AI models. Every session contributes to machine learning.",
  },
  {
    icon: HiSignal,
    title: "AI-Powered Scoring",
    description:
      "Advanced metrics analyze your precision, smoothness, and efficiency. Get instant AI quality ratings.",
  },
  {
    icon: HiTrophy,
    title: "3 Challenge Levels",
    description:
      "From single pick & place to multi-object color sorting. Progressively harder missions test your skills.",
  },
  {
    icon: HiGlobeAlt,
    title: "Global Leaderboard",
    description:
      "Compete with operators worldwide. Earn stars, unlock achievements, and climb the rankings.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as any },
  },
};

// ─── Landing Page ───────────────────────────────────────────────────────────
export default function HomePage() {
  const { userName, setName } = useGameStore();
  const [nameInput, setNameInput] = useState("");
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });

  const handleSetName = () => {
    if (nameInput.trim()) {
      setName(nameInput.trim());
      setNameInput("");
    }
  };

  return (
    <div className="min-h-screen">
      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#C5974B]/5 blur-[120px] animate-pulse" />
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#D4A853]/5 blur-[80px] animate-pulse" style={{ animationDelay: "2s" }} />
          {/* Scan lines */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(197,151,75,0.1) 2px, rgba(197,151,75,0.1) 4px)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C5974B]/10 border border-[#C5974B]/20 mb-8"
            >
              <div className="w-2 h-2 rounded-full bg-[#C5974B] animate-pulse" />
              <span className="text-sm text-[#D4A853] font-medium">
                Teleoperation Platform v2.0
              </span>
            </motion.div>

            {/* Title Logo */}
            <div className="flex justify-center mb-6 select-none pointer-events-none">
              <img 
                src="/logo.png" 
                alt="Prisma(x)" 
                className="h-44 sm:h-64 md:h-[22rem] w-auto mix-blend-screen brightness-110 object-contain"
              />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-200 mb-6 font-[family-name:var(--font-outfit)]">
              Robotic Arm Control Center
            </h2>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed"
            >
              Master teleoperation. Generate training data. Climb the
              leaderboard.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-xs text-amber-500/60 max-w-xl mx-auto mb-12 font-medium"
            >
              ⚠️ Disclaimer: This website is for simulation and fun, do not take it seriously.
            </motion.p>

            {/* Name Input / Welcome */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="max-w-md mx-auto mb-8"
            >
              {userName ? (
                <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/20">
                  <span className="text-gray-400">Welcome back,</span>
                  <span className="text-[#C5974B] font-bold text-lg">
                    {userName}
                  </span>
                </div>
              ) : (
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter your operator name..."
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSetName()}
                    className="flex-1 px-5 py-3.5 rounded-xl bg-black/40 backdrop-blur-sm border border-[#C5974B]/30 text-white placeholder-gray-500 focus:outline-none focus:border-[#C5974B] focus:shadow-[0_0_20px_rgba(197,151,75,0.2)] transition-all text-sm"
                  />
                  <button
                    onClick={handleSetName}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#C5974B] to-[#8B6914] text-black font-semibold text-sm hover:shadow-[0_0_30px_rgba(197,151,75,0.4)] transition-all active:scale-95"
                  >
                    Set Name
                  </button>
                </div>
              )}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Link href="/play">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-10 py-4 rounded-2xl bg-gradient-to-r from-[#C5974B] to-[#D4A853] text-black font-bold text-lg shadow-[0_0_40px_rgba(197,151,75,0.3)] hover:shadow-[0_0_60px_rgba(197,151,75,0.5)] transition-shadow duration-300"
                >
                  <span className="relative z-10">Start Playing</span>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#D4A853] to-[#C5974B] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-5 h-8 rounded-full border-2 border-[#C5974B]/30 flex items-start justify-center p-1"
            >
              <div className="w-1 h-2 rounded-full bg-[#C5974B]/50" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────── */}
      <section className="py-24 px-4" ref={featuresRef}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Built for{" "}
              <span className="bg-gradient-to-r from-[#C5974B] to-[#D4A853] bg-clip-text text-transparent">
                Precision
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Everything you need to master robotic teleoperation and contribute
              to AI training data.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`group p-6 rounded-2xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/10 hover:border-[#C5974B]/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(197,151,75,0.1)] ${
                  i >= 3 ? "sm:col-span-1 lg:col-span-1" : ""
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C5974B]/20 to-[#8B6914]/20 flex items-center justify-center mb-4 group-hover:from-[#C5974B]/30 group-hover:to-[#8B6914]/30 transition-all">
                  <feature.icon className="w-6 h-6 text-[#C5974B]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────────────────── */}
      <section className="py-24 px-4" ref={statsRef}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={statsInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8"
          >
            {[
              {
                value: 12847,
                label: "Operators",
                suffix: "",
                prefix: "",
              },
              {
                value: 89421,
                label: "Sessions",
                suffix: "",
                prefix: "",
              },
              {
                value: 2400000,
                label: "Training Points",
                suffix: "",
                prefix: "",
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="text-center p-8 rounded-2xl bg-black/30 backdrop-blur-xl border border-[#C5974B]/10"
              >
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#C5974B] to-[#D4A853] bg-clip-text text-transparent mb-2">
                  {statsInView && (
                    <AnimatedCounter
                      target={stat.value}
                      suffix={stat.suffix}
                      prefix={stat.prefix}
                      duration={2}
                    />
                  )}
                </div>
                <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Community Disclaimer ─────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs text-gray-600 leading-relaxed">
            This is a community-made concept inspired by PrismaX. All robots,
            telemetry, AI training metrics, statistics, sessions, operator data,
            and leaderboard entries displayed are simulated and intended solely
            for demonstration and entertainment purposes. No actual robotic
            hardware is controlled through this interface.
          </p>
        </div>
      </section>
    </div>
  );
}
