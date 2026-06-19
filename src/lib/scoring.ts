export interface SessionRecord {
  id: string;
  date: string;
  level: number;
  duration: number;
  precision: number;
  objectsPlaced: number;
  totalObjects: number;
  pointsEarned: number;
  stars: number;
  trainingDataPoints: number;
}

export interface SessionReport {
  level: number;
  completionTime: number;
  objectsPlaced: number;
  totalObjects: number;
  totalPoints: number;
  precisionScore: number;
  motionSmoothness: number;
  aiQualityScore: number;
  stars: number;
  trainingDataPoints: number;
  achievementsUnlocked: string[];
}

export function calculateScore(
  completionTime: number,
  objectsPlaced: number,
  totalObjects: number,
  level: number
): Omit<SessionReport, "level" | "completionTime" | "objectsPlaced" | "totalObjects"> {
  const completionRatio = totalObjects > 0 ? objectsPlaced / totalObjects : 0;
  const levelMultiplier = level === 1 ? 1 : level === 2 ? 1.5 : 2.5;

  // Time baseline scales with level: more objects → more time allowed
  const timeBaseline = level === 1 ? 180 : level === 2 ? 360 : 600;
  const threeStarTime = level === 1 ? 90 : level === 2 ? 180 : 300;

  // Time bonus: faster = more points
  const timeFactor = Math.max(0, 1 - completionTime / timeBaseline);
  const timeBonus = Math.floor(timeFactor * 500 * levelMultiplier);

  // Precision: based on completion ratio and speed
  const precisionScore = Math.min(99, Math.floor(completionRatio * 85 + timeFactor * 15));

  // Smoothness: simulated — faster and complete = smoother
  const motionSmoothness = Math.min(99, Math.floor(60 + completionRatio * 25 + timeFactor * 14));

  // Base points for placing objects
  const placementPoints = objectsPlaced * 200 * levelMultiplier;

  // AI quality score
  const aiQualityScore = Math.min(99, Math.floor(completionRatio * 70 + motionSmoothness * 0.3));

  // Training data points (simulated)
  const trainingDataPoints = Math.floor(completionTime * 142 * completionRatio);

  // Stars — thresholds scale per level
  let stars = 1;
  if (completionRatio >= 1 && completionTime < threeStarTime) stars = 3;
  else if (completionRatio >= 1) stars = 2;
  else if (completionRatio >= 0.5) stars = 1;

  // Star bonus
  const starBonus = stars * 100 * levelMultiplier;

  const totalPoints = Math.floor(placementPoints + timeBonus + starBonus);

  // Determine unlocked achievements during this session
  const achievementsUnlocked: string[] = ["first_operator"];
  if (precisionScore >= 95) achievementsUnlocked.push("precision_expert");
  if (motionSmoothness >= 90) achievementsUnlocked.push("stable_hands");
  if (level === 1 && completionTime < 60) achievementsUnlocked.push("speed_demon");
  if (level === 3 && objectsPlaced === totalObjects) achievementsUnlocked.push("color_master");
  if (stars === 3) achievementsUnlocked.push("gold_controller");
  if (trainingDataPoints >= 5000) achievementsUnlocked.push("neural_trainer");

  return {
    totalPoints: Math.max(totalPoints, objectsPlaced > 0 ? 50 : 0),
    precisionScore,
    motionSmoothness,
    stars,
    trainingDataPoints,
    aiQualityScore,
    achievementsUnlocked,
  };
}
