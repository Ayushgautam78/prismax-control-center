// ─── PrismaX Zustand Store ──────────────────────────────────────────────────
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TelemetryData } from "./telemetry";
import { clamp } from "./utils";
import type { SessionRecord, SessionReport } from "./scoring";
export type { SessionRecord, SessionReport };

// ─── Type Definitions ───────────────────────────────────────────────────────

export type GamePhase = "menu" | "playing" | "complete";
export type GameLevel = 1 | 2 | 3 | null;

export interface JointState {
  baseRotation: number;     // degrees, -180 to 180
  shoulderAngle: number;    // degrees, -90 to 90
  elbowAngle: number;       // degrees, -135 to 0
  wristPitch: number;       // degrees, -90 to 90
  wristRotation: number;    // degrees, -180 to 180
  gripperOpen: number;      // 0 (closed) to 100 (open)
}

export interface UserState {
  name: string;
  totalPoints: number;
  achievements: string[];     // achievement IDs
  sessionHistory: SessionRecord[];
  totalJointMoves: number;
  excellentAiCount: number;
  totalTrainingDataPoints: number;
  threeStarLevels: number[];
}

export interface GameState {
  currentLevel: GameLevel;
  phase: GamePhase;
  timer: number;              // seconds elapsed
  score: number;
  objectsPlaced: number;
  totalObjects: number;
  startTime: number | null;   // Date.now() when game started
}

export interface GripState {
  isGripping: boolean;
  heldObjectId: string | null;
}

export interface TelemetryState {
  motorTemp: number;
  torque: number;
  current: number;
  aiConfidence: number;
  motionSmoothness: number;
  latency: number;
  dataRate: number;
  stability: number;
  voltage: number;
  cpu: number;
  gpu: number;
  memory: number;
  packetLoss: number;
}

// ─── Joint limits ───────────────────────────────────────────────────────────

export const JOINT_LIMITS = {
  baseRotation:   { min: -180, max: 180 },
  shoulderAngle:  { min: -90, max: 90 },
  elbowAngle:     { min: -135, max: 0 },
  wristPitch:     { min: -90, max: 90 },
  wristRotation:  { min: -180, max: 180 },
  gripperOpen:    { min: 0, max: 100 },
} as const;

export type JointName = keyof JointState;

// ─── Default values ─────────────────────────────────────────────────────────

const DEFAULT_JOINTS: JointState = {
  baseRotation: 0,
  shoulderAngle: 45,
  elbowAngle: -90,
  wristPitch: 0,
  wristRotation: 0,
  gripperOpen: 100,
};

const DEFAULT_TELEMETRY: TelemetryState = {
  motorTemp: 55,
  torque: 5.0,
  current: 1.5,
  aiConfidence: 88,
  motionSmoothness: 82,
  latency: 15,
  dataRate: 150,
  stability: 90,
  voltage: 12.1,
  cpu: 45,
  gpu: 35,
  memory: 52,
  packetLoss: 0.2,
};

// ─── Level config ───────────────────────────────────────────────────────────

const LEVEL_OBJECTS: Record<number, number> = { 1: 5, 2: 10, 3: 18 };

// ─── Store Actions ──────────────────────────────────────────────────────────

export interface StoreActions {
  // User actions
  setName: (name: string) => void;
  addPoints: (points: number) => void;
  unlockAchievement: (achievementId: string) => void;
  addSession: (session: SessionRecord) => void;
  incrementJointMoves: (count?: number) => void;
  incrementExcellentAi: () => void;
  addTrainingDataPoints: (points: number) => void;
  addThreeStarLevel: (level: number) => void;

  // Joint actions
  setJoint: (joint: JointName, value: number) => void;
  setJoints: (joints: Partial<JointState>) => void;
  resetJoints: () => void;

  // Grip actions
  toggleGrip: () => void;
  setGrip: (isGripping: boolean) => void;
  setHeldObject: (objectId: string | null) => void;

  // Game actions
  startGame: (level: 1 | 2 | 3, objectsOverride?: number) => void;
  endGame: () => void;
  setPhase: (phase: GamePhase) => void;
  incrementTimer: () => void;
  addScore: (points: number) => void;
  placeObject: () => void;
  setObjectsPlaced: (count: number) => void;

  // Telemetry actions
  updateTelemetry: (data: Partial<TelemetryData>) => void;

  // Reset
  resetAll: () => void;

  // Custom additions
  setLastReport: (report: SessionReport | null) => void;
}

// ─── Combined Store Type ────────────────────────────────────────────────────

export interface PrismaXStore extends StoreActions {
  // Nested States (for compatibility with useStore)
  user: UserState;
  joints: JointState;
  game: GameState;
  grip: GripState;
  telemetry: TelemetryState;

  // Flat States (for compatibility with useGameStore)
  // JointState flat
  baseRotation: number;
  shoulderAngle: number;
  elbowAngle: number;
  wristPitch: number;
  wristRotation: number;
  gripperOpen: number;

  // UserState flat (except name -> userName to avoid conflict)
  userName: string;
  totalPoints: number;
  achievements: string[];
  sessionHistory: SessionRecord[];
  totalJointMoves: number;
  excellentAiCount: number;
  totalTrainingDataPoints: number;
  threeStarLevels: number[];

  // GameState flat
  currentLevel: GameLevel;
  phase: GamePhase;
  timer: number;
  score: number;
  objectsPlaced: number;
  totalObjects: number;
  startTime: number | null;

  // GripState flat
  isGripping: boolean;
  heldObjectId: string | null;

  // TelemetryState flat
  motorTemp: number;
  torque: number;
  current: number;
  aiConfidence: number;
  motionSmoothness: number;
  latency: number;
  dataRate: number;
  stability: number;
  voltage: number;
  cpu: number;
  gpu: number;
  memory: number;
  packetLoss: number;

  // Mapped/computed properties in state
  levelBestScores: Record<number, { score: number; stars: number } | null>;
  lastSessionReport: SessionReport | null;
}

// ─── Store Creation ─────────────────────────────────────────────────────────

export const useStore = create<PrismaXStore>()(
  persist(
    (set) => ({
      // ═══ Initial State ══════════════════════════════════════════════════

      // Nested
      user: {
        name: "",
        totalPoints: 0,
        achievements: [],
        sessionHistory: [],
        totalJointMoves: 0,
        excellentAiCount: 0,
        totalTrainingDataPoints: 0,
        threeStarLevels: [],
      },
      joints: { ...DEFAULT_JOINTS },
      game: {
        currentLevel: null,
        phase: "menu",
        timer: 0,
        score: 0,
        objectsPlaced: 0,
        totalObjects: 0,
        startTime: null,
      },
      grip: {
        isGripping: false,
        heldObjectId: null,
      },
      telemetry: { ...DEFAULT_TELEMETRY },

      // Flat
      baseRotation: DEFAULT_JOINTS.baseRotation,
      shoulderAngle: DEFAULT_JOINTS.shoulderAngle,
      elbowAngle: DEFAULT_JOINTS.elbowAngle,
      wristPitch: DEFAULT_JOINTS.wristPitch,
      wristRotation: DEFAULT_JOINTS.wristRotation,
      gripperOpen: DEFAULT_JOINTS.gripperOpen,

      userName: "",
      totalPoints: 0,
      achievements: [],
      sessionHistory: [],
      totalJointMoves: 0,
      excellentAiCount: 0,
      totalTrainingDataPoints: 0,
      threeStarLevels: [],

      currentLevel: null,
      phase: "menu",
      timer: 0,
      score: 0,
      objectsPlaced: 0,
      totalObjects: 0,
      startTime: null,

      isGripping: false,
      heldObjectId: null,

      motorTemp: DEFAULT_TELEMETRY.motorTemp,
      torque: DEFAULT_TELEMETRY.torque,
      current: DEFAULT_TELEMETRY.current,
      aiConfidence: DEFAULT_TELEMETRY.aiConfidence,
      motionSmoothness: DEFAULT_TELEMETRY.motionSmoothness,
      latency: DEFAULT_TELEMETRY.latency,
      dataRate: DEFAULT_TELEMETRY.dataRate,
      stability: DEFAULT_TELEMETRY.stability,
      voltage: DEFAULT_TELEMETRY.voltage,
      cpu: DEFAULT_TELEMETRY.cpu,
      gpu: DEFAULT_TELEMETRY.gpu,
      memory: DEFAULT_TELEMETRY.memory,
      packetLoss: DEFAULT_TELEMETRY.packetLoss,

      // Custom/Mapped
      levelBestScores: {
        1: null,
        2: null,
        3: null,
      },
      lastSessionReport: null,

      // ═══ User Actions ═════════════════════════════════════════════════

      setName: (name: string) =>
        set((state) => ({
          userName: name,
          user: { ...state.user, name },
        })),

      addPoints: (points: number) =>
        set((state) => {
          const newPoints = state.user.totalPoints + points;
          return {
            totalPoints: newPoints,
            user: { ...state.user, totalPoints: newPoints },
          };
        }),

      unlockAchievement: (achievementId: string) =>
        set((state) => {
          if (state.user.achievements.includes(achievementId)) return {};
          const newAchievements = [...state.user.achievements, achievementId];
          return {
            achievements: newAchievements,
            user: {
              ...state.user,
              achievements: newAchievements,
            },
          };
        }),

      addSession: (session: SessionRecord) =>
        set((state) => {
          const newHistory = [session, ...state.user.sessionHistory].slice(0, 100);
          
          const currentBest = state.levelBestScores[session.level];
          const newBest = (!currentBest || session.pointsEarned > currentBest.score)
            ? { score: session.pointsEarned, stars: session.stars }
            : currentBest;

          return {
            sessionHistory: newHistory,
            user: {
              ...state.user,
              sessionHistory: newHistory,
            },
            levelBestScores: {
              ...state.levelBestScores,
              [session.level]: newBest,
            },
          };
        }),

      incrementJointMoves: (count = 1) =>
        set((state) => {
          const newMoves = state.user.totalJointMoves + count;
          return {
            totalJointMoves: newMoves,
            user: {
              ...state.user,
              totalJointMoves: newMoves,
            },
          };
        }),

      incrementExcellentAi: () =>
        set((state) => {
          const newCount = state.user.excellentAiCount + 1;
          return {
            excellentAiCount: newCount,
            user: {
              ...state.user,
              excellentAiCount: newCount,
            },
          };
        }),

      addTrainingDataPoints: (points: number) =>
        set((state) => {
          const newPoints = state.user.totalTrainingDataPoints + points;
          return {
            totalTrainingDataPoints: newPoints,
            user: {
              ...state.user,
              totalTrainingDataPoints: newPoints,
            },
          };
        }),

      addThreeStarLevel: (level: number) =>
        set((state) => {
          if (state.user.threeStarLevels.includes(level)) return {};
          const newLevels = [...state.user.threeStarLevels, level];
          return {
            threeStarLevels: newLevels,
            user: {
              ...state.user,
              threeStarLevels: newLevels,
            },
          };
        }),

      // ═══ Joint Actions ════════════════════════════════════════════════

      setJoint: (joint: JointName, value: number) =>
        set((state) => {
          const limits = JOINT_LIMITS[joint];
          const clampedValue = clamp(value, limits.min, limits.max);
          return {
            [joint]: clampedValue,
            joints: {
              ...state.joints,
              [joint]: clampedValue,
            },
          };
        }),

      setJoints: (newJoints: Partial<JointState>) =>
        set((state) => {
          const updated = { ...state.joints };
          const flatUpdates: Partial<JointState> = {};
          for (const [key, value] of Object.entries(newJoints)) {
            const joint = key as JointName;
            const limits = JOINT_LIMITS[joint];
            const clampedValue = clamp(value, limits.min, limits.max);
            updated[joint] = clampedValue;
            flatUpdates[joint] = clampedValue;
          }
          return {
            joints: updated,
            ...flatUpdates,
          };
        }),

      resetJoints: () =>
        set({
          joints: { ...DEFAULT_JOINTS },
          baseRotation: DEFAULT_JOINTS.baseRotation,
          shoulderAngle: DEFAULT_JOINTS.shoulderAngle,
          elbowAngle: DEFAULT_JOINTS.elbowAngle,
          wristPitch: DEFAULT_JOINTS.wristPitch,
          wristRotation: DEFAULT_JOINTS.wristRotation,
          gripperOpen: DEFAULT_JOINTS.gripperOpen,
        }),

      // ═══ Grip Actions ═════════════════════════════════════════════════

      toggleGrip: () =>
        set((state) => {
          const isGripping = !state.grip.isGripping;
          const gripperOpen = isGripping ? 0 : 100;
          return {
            grip: { ...state.grip, isGripping },
            isGripping,
            joints: {
              ...state.joints,
              gripperOpen,
            },
            gripperOpen,
          };
        }),

      setGrip: (isGripping: boolean) =>
        set((state) => {
          const gripperOpen = isGripping ? 0 : 100;
          return {
            grip: { ...state.grip, isGripping },
            isGripping,
            joints: { ...state.joints, gripperOpen },
            gripperOpen,
          };
        }),

      setHeldObject: (objectId: string | null) =>
        set((state) => ({
          grip: { ...state.grip, heldObjectId: objectId },
          heldObjectId: objectId,
        })),

      // ═══ Game Actions ═════════════════════════════════════════════════

      startGame: (level: 1 | 2 | 3, objectsOverride?: number) =>
        set((state) => {
          const totalObjs = objectsOverride ?? LEVEL_OBJECTS[level];
          const newGame = {
            currentLevel: level,
            phase: "playing" as GamePhase,
            timer: 0,
            score: 0,
            objectsPlaced: 0,
            totalObjects: totalObjs,
            startTime: Date.now(),
          };
          return {
            game: newGame,
            currentLevel: level,
            phase: "playing" as GamePhase,
            timer: 0,
            score: 0,
            objectsPlaced: 0,
            totalObjects: totalObjs,
            startTime: newGame.startTime,

            // Reset joints and grip
            joints: { ...DEFAULT_JOINTS },
            baseRotation: DEFAULT_JOINTS.baseRotation,
            shoulderAngle: DEFAULT_JOINTS.shoulderAngle,
            elbowAngle: DEFAULT_JOINTS.elbowAngle,
            wristPitch: DEFAULT_JOINTS.wristPitch,
            wristRotation: DEFAULT_JOINTS.wristRotation,
            gripperOpen: DEFAULT_JOINTS.gripperOpen,

            grip: { isGripping: false, heldObjectId: null },
            isGripping: false,
            heldObjectId: null,
          };
        }),

      endGame: () =>
        set((state) => {
          const newGame = {
            ...state.game,
            phase: "complete" as GamePhase,
          };
          return {
            game: newGame,
            phase: "complete" as GamePhase,
          };
        }),

      setPhase: (phase: GamePhase) =>
        set((state) => ({
          game: { ...state.game, phase },
          phase,
        })),

      incrementTimer: () =>
        set((state) => {
          const newTimer = state.game.timer + 1;
          return {
            game: { ...state.game, timer: newTimer },
            timer: newTimer,
          };
        }),

      addScore: (points: number) =>
        set((state) => {
          const newScore = state.game.score + points;
          return {
            game: { ...state.game, score: newScore },
            score: newScore,
          };
        }),

      placeObject: () =>
        set((state) => {
          const newPlaced = Math.min(
            state.game.objectsPlaced + 1,
            state.game.totalObjects
          );
          return {
            game: {
              ...state.game,
              objectsPlaced: newPlaced,
            },
            objectsPlaced: newPlaced,
          };
        }),

      setObjectsPlaced: (count: number) =>
        set((state) => ({
          game: { ...state.game, objectsPlaced: count },
          objectsPlaced: count,
        })),

      // ═══ Telemetry Actions ════════════════════════════════════════════

      updateTelemetry: (data: Partial<TelemetryData>) =>
        set((state) => {
          const newTelemetry = {
            ...state.telemetry,
            ...data,
            motionSmoothness: data.smoothness ?? state.telemetry.motionSmoothness,
          };
          return {
            telemetry: newTelemetry,
            ...newTelemetry,
          };
        }),

      // ═══ Reset ════════════════════════════════════════════════════════

      resetAll: () =>
        set({
          user: {
            name: "",
            totalPoints: 0,
            achievements: [],
            sessionHistory: [],
            totalJointMoves: 0,
            excellentAiCount: 0,
            totalTrainingDataPoints: 0,
            threeStarLevels: [],
          },
          joints: { ...DEFAULT_JOINTS },
          game: {
            currentLevel: null,
            phase: "menu",
            timer: 0,
            score: 0,
            objectsPlaced: 0,
            totalObjects: 0,
            startTime: null,
          },
          grip: {
            isGripping: false,
            heldObjectId: null,
          },
          telemetry: { ...DEFAULT_TELEMETRY },

          // Flat states
          baseRotation: DEFAULT_JOINTS.baseRotation,
          shoulderAngle: DEFAULT_JOINTS.shoulderAngle,
          elbowAngle: DEFAULT_JOINTS.elbowAngle,
          wristPitch: DEFAULT_JOINTS.wristPitch,
          wristRotation: DEFAULT_JOINTS.wristRotation,
          gripperOpen: DEFAULT_JOINTS.gripperOpen,

          userName: "",
          totalPoints: 0,
          achievements: [],
          sessionHistory: [],
          totalJointMoves: 0,
          excellentAiCount: 0,
          totalTrainingDataPoints: 0,
          threeStarLevels: [],

          currentLevel: null,
          phase: "menu",
          timer: 0,
          score: 0,
          objectsPlaced: 0,
          totalObjects: 0,
          startTime: null,

          isGripping: false,
          heldObjectId: null,

          motorTemp: DEFAULT_TELEMETRY.motorTemp,
          torque: DEFAULT_TELEMETRY.torque,
          current: DEFAULT_TELEMETRY.current,
          aiConfidence: DEFAULT_TELEMETRY.aiConfidence,
          motionSmoothness: DEFAULT_TELEMETRY.motionSmoothness,
          latency: DEFAULT_TELEMETRY.latency,
          dataRate: DEFAULT_TELEMETRY.dataRate,
          stability: DEFAULT_TELEMETRY.stability,
          voltage: DEFAULT_TELEMETRY.voltage,
          cpu: DEFAULT_TELEMETRY.cpu,
          gpu: DEFAULT_TELEMETRY.gpu,
          memory: DEFAULT_TELEMETRY.memory,
          packetLoss: DEFAULT_TELEMETRY.packetLoss,

          levelBestScores: {
            1: null,
            2: null,
            3: null,
          },
          lastSessionReport: null,
        }),

      // Custom / Mapped Actions
      setLastReport: (report: SessionReport | null) =>
        set({ lastSessionReport: report }),
    }),
    {
      name: "prismax-control-center-storage",
      // Only persist user data and leaderboard best scores
      partialize: (state) => ({
        user: state.user,
        userName: state.userName,
        totalPoints: state.totalPoints,
        achievements: state.achievements,
        sessionHistory: state.sessionHistory,
        totalJointMoves: state.totalJointMoves,
        excellentAiCount: state.excellentAiCount,
        totalTrainingDataPoints: state.totalTrainingDataPoints,
        threeStarLevels: state.threeStarLevels,
        levelBestScores: state.levelBestScores,
      }),
    }
  )
);

// ─── Alias for compatibility with ui-pages ──────────────────────────────────
export const useGameStore = useStore;

// ─── Selector hooks for common patterns ─────────────────────────────────────

/** Select only user state to avoid re-renders from other state changes */
export const useUser = () => useStore((s) => s.user);

/** Select only joint state */
export const useJoints = () => useStore((s) => s.joints);

/** Select only game state */
export const useGame = () => useStore((s) => s.game);

/** Select only grip state */
export const useGrip = () => useStore((s) => s.grip);

/** Select only telemetry state */
export const useTelemetry = () => useStore((s) => s.telemetry);

/** Check if a specific achievement is unlocked */
export const useIsAchievementUnlocked = (id: string) =>
  useStore((s) => s.user.achievements.includes(id));

/** Get the user's level title based on total points */
export const useUserTitle = () =>
  useStore((s) => {
    const pts = s.user.totalPoints;
    if (pts >= 40000) return "Legend";
    if (pts >= 25000) return "Elite";
    if (pts >= 12000) return "Expert";
    if (pts >= 5000) return "Operator";
    return "Rookie";
  });
