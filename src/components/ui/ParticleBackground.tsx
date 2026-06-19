"use client";

import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export default function ParticleBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const pts: Particle[] = [];
    for (let i = 0; i < 30; i++) {
      pts.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 10,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }
    setParticles(pts);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <style jsx>{`
        @keyframes floatUp {
          0% {
            transform: translateY(100vh) translateX(0px);
            opacity: 0;
          }
          10% {
            opacity: var(--particle-opacity);
          }
          90% {
            opacity: var(--particle-opacity);
          }
          100% {
            transform: translateY(-20vh) translateX(30px);
            opacity: 0;
          }
        }
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.5);
          }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={
            {
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: `radial-gradient(circle, rgba(197,151,75,${p.opacity}) 0%, rgba(212,168,83,${p.opacity * 0.5}) 50%, transparent 70%)`,
              boxShadow: `0 0 ${p.size * 2}px rgba(197,151,75,${p.opacity * 0.5})`,
              animation: `floatUp ${p.duration}s linear ${p.delay}s infinite`,
              "--particle-opacity": p.opacity,
            } as React.CSSProperties
          }
        />
      ))}
      {/* Ambient glow orbs */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.03]"
        style={{
          background: "radial-gradient(circle, #C5974B 0%, transparent 70%)",
          top: "10%",
          left: "-10%",
          animation: "pulse 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-[0.02]"
        style={{
          background: "radial-gradient(circle, #D4A853 0%, transparent 70%)",
          bottom: "20%",
          right: "-5%",
          animation: "pulse 12s ease-in-out 4s infinite",
        }}
      />
    </div>
  );
}
