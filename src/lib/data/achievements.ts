// ─── PrismaX Achievements System ────────────────────────────────────────────

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

/** All available achievements in PrismaX Control Center. */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_operator",
    name: "First Operator",
    description: "Complete your first teleop session",
    icon: "🎮",
    unlocked: false,
  },
  {
    id: "precision_expert",
    name: "Precision Expert",
    description: "Achieve 95%+ precision in any session",
    icon: "🎯",
    unlocked: false,
  },
  {
    id: "stable_hands",
    name: "Stable Hands",
    description: "Maintain 90%+ smoothness throughout a session",
    icon: "✋",
    unlocked: false,
  },
  {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Complete Level 1 in under 30 seconds",
    icon: "⚡",
    unlocked: false,
  },
  {
    id: "color_master",
    name: "Color Master",
    description: "Place all objects correctly in Level 2 (color sorting)",
    icon: "🎨",
    unlocked: false,
  },
  {
    id: "motion_master",
    name: "Motion Master",
    description: "Move the arm through 500 total joint adjustments",
    icon: "🦾",
    unlocked: false,
  },
  {
    id: "robot_whisperer",
    name: "Robot Whisperer",
    description: "Keep motor temperature below 60°C for an entire session",
    icon: "🤖",
    unlocked: false,
  },
  {
    id: "elite_operator",
    name: "Elite Operator",
    description: "Earn 3 stars on all three levels",
    icon: "🏅",
    unlocked: false,
  },
  {
    id: "gold_controller",
    name: "Gold Controller",
    description: "Accumulate 10,000 total points",
    icon: "🥇",
    unlocked: false,
  },
  {
    id: "neural_trainer",
    name: "Neural Trainer",
    description: "Generate 5,000 training data points for the AI",
    icon: "🧠",
    unlocked: false,
  },
  {
    id: "ai_mentor",
    name: "AI Mentor",
    description: "Achieve 'Excellent' AI quality rating 3 times",
    icon: "🤝",
    unlocked: false,
  },
  {
    id: "master_engineer",
    name: "Master Engineer",
    description: "Complete 20 total sessions",
    icon: "🔬",
    unlocked: false,
  },
  {
    id: "physical_ai_pioneer",
    name: "Physical AI Pioneer",
    description: "Earn 25,000+ total points and complete all levels",
    icon: "🚀",
    unlocked: false,
  },
];

/**
 * Returns a fresh copy of the achievements list with unlock status applied
 * based on the provided unlocked IDs.
 */
export function getAchievements(unlockedIds: string[]): Achievement[] {
  return ACHIEVEMENTS.map((a) => ({
    ...a,
    unlocked: unlockedIds.includes(a.id),
  }));
}

// ─── Achievement state used for checking ────────────────────────────────────
export interface AchievementCheckState {
  totalPoints: number;
  sessionsCompleted: number;
  achievements: string[];
  lastSessionPrecision?: number;
  lastSessionSmoothness?: number;
  lastSessionLevel?: number;
  lastSessionTime?: number;
  lastSessionObjectsPlaced?: number;
  lastSessionTotalObjects?: number;
  lastSessionAiQuality?: string;
  totalTrainingDataPoints?: number;
  excellentAiCount?: number;
  totalJointMoves?: number;
  maxMotorTempInSession?: number;
  threeStarLevels?: number[];
}

/**
 * Check which achievements the user has newly unlocked based on their state.
 * Returns an array of newly-unlocked achievement IDs (excludes already unlocked).
 */
export function checkAchievements(userState: AchievementCheckState): string[] {
  const newlyUnlocked: string[] = [];
  const already = new Set(userState.achievements);

  function tryUnlock(id: string, condition: boolean) {
    if (!already.has(id) && condition) {
      newlyUnlocked.push(id);
    }
  }

  // First Operator — completed at least 1 session
  tryUnlock("first_operator", userState.sessionsCompleted >= 1);

  // Precision Expert — 95%+ precision in last session
  tryUnlock(
    "precision_expert",
    (userState.lastSessionPrecision ?? 0) >= 95
  );

  // Stable Hands — 90%+ smoothness in last session
  tryUnlock(
    "stable_hands",
    (userState.lastSessionSmoothness ?? 0) >= 90
  );

  // Speed Demon — complete Level 1 in under 30 seconds
  tryUnlock(
    "speed_demon",
    userState.lastSessionLevel === 1 && (userState.lastSessionTime ?? 999) < 30
  );

  // Color Master — all objects placed in Level 2
  tryUnlock(
    "color_master",
    userState.lastSessionLevel === 2 &&
      (userState.lastSessionObjectsPlaced ?? 0) >= (userState.lastSessionTotalObjects ?? 999)
  );

  // Motion Master — 500 total joint adjustments
  tryUnlock(
    "motion_master",
    (userState.totalJointMoves ?? 0) >= 500
  );

  // Robot Whisperer — motor temp stayed under 60°C for the session
  tryUnlock(
    "robot_whisperer",
    (userState.maxMotorTempInSession ?? 100) < 60
  );

  // Elite Operator — 3 stars on all three levels
  tryUnlock(
    "elite_operator",
    (userState.threeStarLevels ?? []).length >= 3 &&
      [1, 2, 3].every((l) => (userState.threeStarLevels ?? []).includes(l))
  );

  // Gold Controller — 10,000 total points
  tryUnlock("gold_controller", userState.totalPoints >= 10000);

  // Neural Trainer — 5,000 training data points
  tryUnlock(
    "neural_trainer",
    (userState.totalTrainingDataPoints ?? 0) >= 5000
  );

  // AI Mentor — "Excellent" AI quality 3 times
  tryUnlock(
    "ai_mentor",
    (userState.excellentAiCount ?? 0) >= 3
  );

  // Master Engineer — 20 sessions
  tryUnlock("master_engineer", userState.sessionsCompleted >= 20);

  // Physical AI Pioneer — 25k points and all levels completed
  tryUnlock(
    "physical_ai_pioneer",
    userState.totalPoints >= 25000 &&
      (userState.threeStarLevels ?? []).length >= 3
  );

  return newlyUnlocked;
}
