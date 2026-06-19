"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative border-t border-[#C5974B]/20 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 select-none">
              <img 
                src="/logo.png" 
                alt="Prisma(x)" 
                className="h-8 w-auto mix-blend-screen brightness-110 object-contain"
              />
              <span className="text-xs font-semibold text-white/40 uppercase tracking-[0.2em] font-mono">
                Control Center
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Master robotic teleoperation through gamified challenges.
              Generate high-quality training data for AI systems.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#C5974B] uppercase tracking-wider">
              Quick Links
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { href: "/play", label: "Play Missions" },
                { href: "/leaderboard", label: "Leaderboard" },
                { href: "/profile", label: "Operator Profile" },
                { href: "/statistics", label: "Training Statistics" },
                { href: "/sessions", label: "Session History" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-[#D4A853] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#C5974B] uppercase tracking-wider">
              About
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              A gamified teleoperation interface concept for robotic arm control
              and AI training data generation.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="pt-8 border-t border-white/5">
          <p className="text-xs text-gray-600 text-center leading-relaxed max-w-3xl mx-auto">
            This is a community-made concept inspired by PrismaX. All robots,
            telemetry, AI training metrics, statistics, sessions, operator data,
            and leaderboard entries are simulated and intended solely for
            demonstration purposes.
          </p>
          <p className="text-xs text-amber-500/50 text-center mt-2 max-w-3xl mx-auto font-semibold">
            ⚠️ Disclaimer: This website is for simulation and fun, do not take it seriously.
          </p>
          <p className="text-xs text-gray-700 text-center mt-4">
            © {new Date().getFullYear()} PrismaX Control Center. All rights
            reserved.
          </p>
          <p className="text-xs text-gray-500 text-center mt-2 font-mono">
            Made by{" "}
            <a 
              href="https://x.com/whoami5172" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#C5974B] hover:text-[#D4A853] hover:underline transition-all font-semibold"
            >
              whoami
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
