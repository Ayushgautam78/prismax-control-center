'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { HiTrophy, HiClock, HiArrowRight, HiArrowPath, HiMiniCamera, HiPrinter, HiArrowLeft, HiSparkles, HiSignal, HiExclamationTriangle, HiCheckCircle } from 'react-icons/hi2';
import { useGameStore } from '@/lib/store';
import { formatTime } from '@/lib/utils';

interface LevelCompleteModalProps {
  isOpen: boolean;
  level: number;
  score: number;
  timer: number;
  stars: number;
  precision: number;
  trainingPoints: number;
  onRetry: () => void;
}

const LOG_TEMPLATE = [
  'Initializing PrismaX demonstration recorder...',
  'Extracting joint telemetry vectors at 1000Hz...',
  'Filtering high-frequency operator jitter...',
  'Replaying trajectory for velocity estimation...',
  'Compiling 14,800 simulated training tokens...',
  'Evaluating motion smoothness coefficients...',
  'Simulating neural policy gradients...',
  'Generating offline imitation learning dataset...',
  'Uploading training vectors to PrismaX AI Core...',
  'Demonstration verified. Generating certificate keys...'
];

export default function LevelCompleteModal({
  isOpen,
  level,
  score,
  timer,
  stars,
  precision,
  trainingPoints,
  onRetry,
}: LevelCompleteModalProps) {
  const router = useRouter();
  const userName = useGameStore((s) => s.userName);
  const [step, setStep] = useState<'stats' | 'certificate_form' | 'certificate_preview'>('stats');
  // Data processing animation states
  const [isProcessing, setIsProcessing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Certificate Form inputs
  const [operatorName, setOperatorName] = useState(userName || 'Anonymous Operator');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(850);

  useEffect(() => {
    if (step === 'certificate_preview' && containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          setContainerWidth(entry.contentRect.width);
        }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [step, isOpen]);

  // Computations for telemetry report
  const [metrics, setMetrics] = useState({
    mistakes: 0,
    nominalManeuvers: 0,
    dataPackets: 0
  });
  useEffect(() => {
    if (isOpen) {
      // Re-trigger loading animation
      setIsProcessing(true);
      setProgress(0);
      setLogs([LOG_TEMPLATE[0]]);
      
      // Calculate realistic metrics
      const calculatedMistakes = Math.max(1, Math.floor(timer / 25) + (score % 3));
      const calculatedNominals = Math.max(5, Math.floor(score / 40) + 12);
      const calculatedPackets = timer * 128 + score * 8;
      
      setMetrics({
        mistakes: calculatedMistakes,
        nominalManeuvers: calculatedNominals,
        dataPackets: calculatedPackets
      });
    }
  }, [isOpen, score, timer]);

  // Loading logs ticker effect
  useEffect(() => {
    if (!isOpen) return;

    setIsProcessing(true);
    setProgress(0);
    setLogs([LOG_TEMPLATE[0]]);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      if (currentProgress >= 100) {
        setProgress(100);
        clearInterval(interval);
        setTimeout(() => setIsProcessing(false), 400);
        return;
      }

      setProgress(currentProgress);

      const logIndex = Math.floor((currentProgress / 100) * LOG_TEMPLATE.length);
      setLogs((prevLogs) => {
        const nextLog = LOG_TEMPLATE[logIndex];
        if (nextLog && !prevLogs.includes(nextLog)) {
          return [...prevLogs, nextLog];
        }
        return prevLogs;
      });
    }, 75); // Ticks smoothly and fast without restarting

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (userName) {
      setOperatorName(userName);
    }
  }, [userName]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  const padding = 24;
  const scale = Math.min(1, (containerWidth - padding) / 850);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md overflow-y-auto p-4">
      {/* Dynamic CSS for printing certificate only */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide everything in the document */
          body * {
            visibility: hidden;
            background: none !important;
          }
          /* Show only the certificate print wrapper */
          .print-certificate-container, .print-certificate-container * {
            visibility: visible;
          }
          .print-certificate-container {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            display: flex !important;
            align-items: center;
            justify-content: center;
            background: #050505 !important;
            z-index: 99999;
          }
          /* Setup landscape A4 size */
          @page {
            size: landscape;
            margin: 0;
          }
        }
      `}} />

      <AnimatePresence mode="wait">
        {/* Step 0: Simulated Training Data Processing Animation */}
        {isProcessing && (
          <motion.div
            key="processing"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass-strong rounded-3xl p-6 md:p-8 max-w-md w-full border border-[#C5974B]/20 shadow-2xl relative overflow-hidden text-left"
          >
            <div className="flex items-center gap-3 mb-4">
              <HiSignal className="text-[#C5974B] text-2xl animate-pulse" />
              <div>
                <h3 className="text-lg font-bold text-white font-[family-name:var(--font-outfit)]">
                  Data Stream Capture
                </h3>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">
                  PrismaX Demonstration Recording
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-white/60 font-semibold">Compiling logs...</span>
                <span className="text-[#D4A853] font-mono font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-white/5 border border-white/5 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#C5974B] to-[#D4A853] h-full transition-all duration-100 shadow-[0_0_8px_rgba(197,151,75,0.4)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Simulated Live Logging Output */}
            <div className="bg-black/40 border border-white/5 rounded-xl p-3 h-40 font-mono text-[9px] text-[#D4A853]/90 overflow-y-auto space-y-1.5 leading-normal flex flex-col justify-end">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-1.5">
                  <span className="text-white/20 select-none">[{i + 1}]</span>
                  <span className="truncate">{log}</span>
                </div>
              ))}
              <div className="w-2 h-3.5 bg-[#D4A853]/60 animate-pulse mt-0.5 inline-block" />
            </div>
          </motion.div>
        )}

        {/* Step 1: Main Statistics Card */}
        {!isProcessing && step === 'stats' && (
          <motion.div
            key="stats"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-strong rounded-3xl p-6 md:p-8 max-w-lg w-full text-center border border-[#C5974B]/20 shadow-2xl relative overflow-hidden"
          >
            {/* Background elements */}
            <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[#C5974B]/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-[#D4A853]/10 blur-3xl pointer-events-none" />

            <div className="text-5xl mb-3">🏆</div>
            <h2 className="text-3xl font-extrabold gold-gradient-text font-[family-name:var(--font-outfit)] tracking-tight">
              Level {level} Completed!
            </h2>
            <p className="text-white/60 text-sm mt-1 mb-6">
              Sensors calibrated. Teleoperation training session complete.
            </p>

            {/* Stars */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3].map((star) => (
                <motion.span
                  key={star}
                  initial={{ scale: 0 }}
                  animate={{ scale: star <= stars ? 1 : 0.6 }}
                  className={`text-4xl ${star <= stars ? 'text-[#C5974B] drop-shadow-[0_0_8px_rgba(197,151,75,0.6)]' : 'text-white/10'}`}
                >
                  ★
                </motion.span>
              ))}
            </div>

            {/* Primary Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="glass rounded-xl p-2.5 bg-white/5 border border-white/5">
                <div className="text-[9px] text-white/40 uppercase tracking-widest font-semibold mb-0.5">
                  Points
                </div>
                <div className="text-lg font-bold text-[#D4A853] font-mono">{score}</div>
              </div>
              <div className="glass rounded-xl p-2.5 bg-white/5 border border-white/5">
                <div className="text-[9px] text-white/40 uppercase tracking-widest font-semibold mb-0.5">
                  Duration
                </div>
                <div className="text-lg font-bold text-white font-mono">{formatTime(timer)}</div>
              </div>
              <div className="glass rounded-xl p-2.5 bg-white/5 border border-white/5">
                <div className="text-[9px] text-white/40 uppercase tracking-widest font-semibold mb-0.5">
                  Precision
                </div>
                <div className="text-lg font-bold text-white font-mono">{precision}%</div>
              </div>
              <div className="glass rounded-xl p-2.5 bg-white/5 border border-white/5">
                <div className="text-[9px] text-white/40 uppercase tracking-widest font-semibold mb-0.5">
                  Training Data
                </div>
                <div className="text-lg font-bold text-green-400 font-mono">+{trainingPoints}MB</div>
              </div>
            </div>

            {/* Telemetry log report (mistakes and nominal items) */}
            <div className="border border-white/5 bg-white/5 rounded-2xl p-4 text-left mb-6 space-y-2">
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest border-b border-white/5 pb-1.5 mb-2.5 flex items-center gap-1.5">
                📊 Operational Telemetry Log
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60 flex items-center gap-1">
                  <HiCheckCircle className="text-emerald-500 text-sm" /> Nominal Maneuvers
                </span>
                <span className="text-emerald-400 font-bold font-mono">{metrics.nominalManeuvers}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60 flex items-center gap-1">
                  <HiExclamationTriangle className="text-amber-500 text-sm" /> Operator Deviations/Mistakes
                </span>
                <span className="text-amber-400 font-bold font-mono">{metrics.mistakes}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60 flex items-center gap-1">
                  ⚡ Telemetry Log Packets
                </span>
                <span className="text-[#D4A853] font-bold font-mono">{metrics.dataPackets.toLocaleString()} pkts</span>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                {level < 3 ? (
                  <button
                    onClick={() => {
                      router.push(`/play/${level + 1}`);
                    }}
                    className="flex-1 gold-gradient-bg text-black font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-95 transition-all shadow-lg text-sm"
                  >
                    Start Level {level + 1}
                    <HiArrowRight size={15} />
                  </button>
                ) : (
                  <button
                    onClick={() => setStep('certificate_form')}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-95 transition-all shadow-lg text-sm"
                  >
                    <HiSparkles size={15} />
                    Get Certificate
                  </button>
                )}

                {/* Check Leaderboard Option */}
                <button
                  onClick={() => router.push('/leaderboard')}
                  className="flex-1 glass border border-[#C5974B]/20 text-[#C5974B] hover:text-white hover:bg-[#C5974B]/10 py-3 px-4 rounded-xl active:scale-95 transition-all text-sm font-semibold flex items-center justify-center gap-1"
                >
                  Leaderboard
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onRetry}
                  className="flex-1 glass text-white/80 hover:text-white py-2.5 px-4 rounded-xl border border-white/5 hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-1.5 text-xs font-semibold"
                >
                  <HiArrowPath size={14} /> Retry Level
                </button>
                <button
                  onClick={() => router.push('/play')}
                  className="flex-1 glass text-white/60 hover:text-white py-2.5 px-4 rounded-xl border border-white/5 hover:bg-white/10 active:scale-95 transition-all text-xs font-semibold"
                >
                  Back to Levels
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Certificate Form */}
        {!isProcessing && step === 'certificate_form' && (
          <motion.div
            key="certificate_form"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-strong rounded-3xl p-6 md:p-8 max-w-md w-full border border-white/10 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setStep('stats')}
                className="p-2 rounded-lg bg-white/5 border border-white/5 text-white/60 hover:text-white active:scale-90 transition-all"
              >
                <HiArrowLeft size={16} />
              </button>
              <h3 className="text-xl font-bold text-white font-[family-name:var(--font-outfit)]">
                Certificate Details
              </h3>
            </div>

            <p className="text-white/50 text-xs mb-5">
              Specify your operator identity details to generate your certified PrismaX Robotic Teleoperation transcript.
            </p>

            <div className="space-y-4 mb-6">
              {/* Operator Name */}
              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1.5">
                  Operator Name
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#C5974B]/50 transition-colors"
                  placeholder="Enter name"
                />
              </div>

              {/* Profile Photo Uploader */}
              <div>
                <label className="block text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1.5">
                  Operator Photo / Badge Image
                </label>
                
                <div className="flex items-center gap-4">
                  {/* Photo Preview Container */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-xl border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center cursor-pointer hover:border-[#C5974B]/30 transition-all flex-shrink-0 group relative"
                  >
                    {photoUrl ? (
                      <>
                        <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <HiMiniCamera className="text-white text-base" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-white/30 group-hover:text-white/60 transition-colors">
                        <HiMiniCamera size={20} />
                        <span className="text-[9px] font-semibold">Upload</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-left">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="glass text-[11px] font-bold text-[#C5974B] hover:bg-[#C5974B]/10 hover:text-white px-3 py-1.5 rounded-lg border border-[#C5974B]/20 active:scale-95 transition-all"
                    >
                      Select File
                    </button>
                    <p className="text-[10px] text-white/30 mt-1">
                      Supports JPG, PNG or WebP. Stored locally.
                    </p>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            <button
              onClick={() => setStep('certificate_preview')}
              className="w-full gold-gradient-bg text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all gold-glow"
            >
              Generate Certificate Preview
            </button>
          </motion.div>
        )}

        {/* Step 3: Certificate Preview Dashboard */}
        {!isProcessing && step === 'certificate_preview' && (
          <motion.div
            key="certificate_preview"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-4xl glass-strong border border-[#C5974B]/35 rounded-3xl p-4 md:p-6 shadow-2xl flex flex-col items-center relative overflow-hidden"
          >
            {/* Action Bar (Top) */}
            <div className="w-full flex items-center justify-between gap-4 mb-4 border-b border-white/5 pb-3">
              <button
                onClick={() => setStep('certificate_form')}
                className="flex items-center gap-1 text-[#C5974B] hover:text-white text-xs font-semibold transition-colors active:scale-95"
              >
                <HiArrowLeft size={14} /> Adjust Details
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={triggerPrint}
                  className="gold-gradient-bg text-black font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all shadow-md"
                >
                  <HiPrinter size={14} /> Print / Save PDF
                </button>
                <button
                  onClick={() => router.push('/play')}
                  className="glass border border-white/10 text-white/70 hover:text-white text-xs py-2 px-3 rounded-lg active:scale-95 transition-all"
                >
                  Finish Session
                </button>
              </div>
            </div>

            {/* Certificate Print Wrapper */}
            <div
              ref={containerRef}
              className="print-certificate-container w-full flex justify-center bg-black/40 p-2 md:p-4 rounded-2xl overflow-hidden"
            >
              {/* Actual Certificate Document Card */}
              <div
                id="certificate-to-print"
                className="w-[850px] h-[530px] rounded-xl relative p-8 md:p-10 flex flex-col justify-between border-4 border-double border-[#C5974B] bg-[#050505] text-white overflow-hidden shadow-inner flex-shrink-0 transition-transform origin-top"
                style={{
                  transform: `scale(${scale})`,
                  marginBottom: `${(scale - 1) * 530}px`,
                  boxShadow: 'inset 0 0 50px rgba(197, 151, 75, 0.15)',
                }}
              >
                {/* Tech scan lines background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.06),_rgba(0,255,0,0.02),_rgba(0,0,255,0.06))] bg-[size:100%_4px,_6px_100%] pointer-events-none opacity-20" />
                
                {/* Certificate corner tech brackets */}
                <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[#C5974B]/50" />
                <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[#C5974B]/50" />
                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[#C5974B]/50" />
                <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[#C5974B]/50" />

                {/* Robotic arm watermark */}
                <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                  <svg width="350" height="350" viewBox="0 0 100 100" fill="none" stroke="#D4A853" strokeWidth="1.5">
                    <rect x="40" y="80" width="20" height="15" rx="2" />
                    <line x1="50" y1="80" x2="50" y2="50" />
                    <line x1="50" y1="50" x2="65" y2="30" />
                    <circle cx="50" cy="50" r="4" fill="#D4A853" />
                    <circle cx="65" cy="30" r="4" fill="#D4A853" />
                    <line x1="65" y1="30" x2="55" y2="15" />
                    <circle cx="55" cy="15" r="3" fill="#D4A853" />
                    <path d="M 50,15 L 60,15" />
                  </svg>
                </div>

                {/* Header block */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] font-bold text-[#C5974B] uppercase tracking-[0.25em]">
                      PRISMAX AI SYSTEMS
                    </div>
                    <div className="text-lg font-extrabold text-white font-[family-name:var(--font-outfit)] tracking-tight">
                      HUMAN-ROBOTICS TELEOPERATION LABS
                    </div>
                  </div>
                  
                  {/* Status badge */}
                  <div className="border border-green-500/30 bg-green-500/10 text-green-400 text-[9px] font-mono px-3 py-1 rounded font-bold uppercase tracking-wider">
                    OPERATOR QUALIFIED
                  </div>
                </div>

                {/* Title block */}
                <div className="text-center my-2">
                  <h1 className="text-3xl font-extrabold gold-gradient-text tracking-wider uppercase font-[family-name:var(--font-outfit)]">
                    Certificate of Competency
                  </h1>
                  <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] mt-1">
                    For Advanced Robotic Telemanipulation & Sorting
                  </p>
                </div>

                {/* Main Body */}
                <div className="flex items-center gap-6 my-4">
                  {/* Left Side: Avatar/Photo */}
                  <div className="relative w-28 h-28 border-2 border-[#C5974B]/40 bg-white/5 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center shadow-lg">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Operator Portrait" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center flex flex-col items-center gap-1.5 p-2">
                        <span className="text-3xl">🦾</span>
                        <span className="text-[7px] text-white/30 uppercase font-mono tracking-widest font-bold">
                          PX-UNIT-01
                        </span>
                      </div>
                    )}
                    
                    {/* Scanner animation */}
                    <div className="absolute left-0 right-0 top-0 h-0.5 bg-[#C5974B]/80 shadow-[0_0_8px_#C5974B] animate-[scan_2s_infinite_linear]" />
                    <style dangerouslySetInnerHTML={{ __html: `
                      @keyframes scan {
                        0% { top: 0%; }
                        50% { top: 100%; }
                        100% { top: 0%; }
                      }
                    `}} />
                  </div>

                  {/* Right Side: Statement */}
                  <div className="flex-1 text-left">
                    <p className="text-xs text-white/50 italic">This is to certify that human operator</p>
                    <h3 className="text-2xl font-bold text-white border-b border-white/10 pb-1.5 my-1.5 font-[family-name:var(--font-outfit)] tracking-wide">
                      {operatorName}
                    </h3>
                    <p className="text-[11px] text-white/60 leading-relaxed">
                      has successfully passed all simulation parameters of the <span className="text-[#D4A853] font-bold">PrismaX Robotic Arm Simulator</span>. 
                      The operator demonstrated proficiency in forward kinematics joint controls, collision-free object routing, and high-precision color sorting.
                    </p>
                  </div>
                </div>

                {/* Stats & Signatures Footer */}
                <div className="flex justify-between items-end border-t border-white/5 pt-4">
                  {/* Stats columns */}
                  <div className="flex gap-6">
                    <div>
                      <div className="text-[8px] text-white/30 uppercase font-semibold">Overall Score</div>
                      <div className="text-sm font-bold text-[#D4A853] font-mono">{score}</div>
                    </div>
                    <div>
                      <div className="text-[8px] text-white/30 uppercase font-semibold">Precision</div>
                      <div className="text-sm font-bold text-white font-mono">{precision}%</div>
                    </div>
                    <div>
                      <div className="text-[8px] text-white/30 uppercase font-semibold">Training Yield</div>
                      <div className="text-sm font-bold text-white font-mono">{trainingPoints} MB</div>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="flex gap-8">
                    <div className="text-center w-28">
                      <div className="h-6 flex items-center justify-center">
                        <svg width="70" height="20" viewBox="0 0 100 30" fill="none" stroke="#D4A853" strokeWidth="1">
                          <path d="M 0,15 Q 10,2 20,25 T 40,5 T 60,20 T 80,10 T 100,15" />
                        </svg>
                      </div>
                      <div className="border-t border-white/15 pt-1 text-[8px] text-white/40 uppercase font-semibold tracking-wider">
                        PrismaX Core AI
                      </div>
                    </div>
                    
                    <div className="text-center w-28">
                      <div className="h-6 flex items-center justify-center font-serif text-[10px] text-[#C5974B] italic select-none">
                        PrismaX System
                      </div>
                      <div className="border-t border-white/15 pt-1 text-[8px] text-white/40 uppercase font-semibold tracking-wider">
                        Human Ops Lead
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
