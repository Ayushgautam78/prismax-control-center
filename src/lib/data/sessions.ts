// ─── PrismaX Fake Session History ───────────────────────────────────────────

export interface SessionRecord {
  id: string;
  date: string;           // ISO date string
  level: 1 | 2 | 3;
  duration: number;       // seconds
  precision: number;      // percentage 0–100
  objectsPlaced: number;
  totalObjects: number;
  pointsEarned: number;
  stars: 1 | 2 | 3;
  trainingDataPoints: number;
}

/**
 * Seeded RNG (mulberry32) for deterministic session data.
 */
function createRng(seed: number) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LEVEL_OBJECTS: Record<number, number> = { 1: 3, 2: 5, 3: 8 };

/**
 * Generate 30 fake past sessions spread across the last 30 days.
 * Each session has realistic stats that correlate with each other.
 */
export function getFakeSessions(): SessionRecord[] {
  const rng = createRng(1337);
  const sessions: SessionRecord[] = [];
  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < 30; i++) {
    // Random date within last 30 days
    const dateOffset = Math.floor(rng() * thirtyDaysMs);
    const date = new Date(now - dateOffset);

    // Level distribution weighted toward easier levels
    const levelRoll = rng();
    const level: 1 | 2 | 3 = levelRoll < 0.45 ? 1 : levelRoll < 0.8 ? 2 : 3;

    const totalObjects = LEVEL_OBJECTS[level];

    // Duration scales with level and randomness: 20–300 seconds
    const baseDuration = level * 30;
    const duration = Math.round(
      Math.max(20, Math.min(300, baseDuration + rng() * 200 - 40))
    );

    // Precision: 60–99%, tends to be higher on lower levels
    const precisionBase = 95 - level * 8;
    const precision = Math.round(
      Math.max(60, Math.min(99, precisionBase + (rng() - 0.3) * 25))
    );

    // Objects placed based on precision
    const objectsPlaced = Math.round(
      Math.max(1, Math.min(totalObjects, totalObjects * (precision / 100) + (rng() - 0.5)))
    );

    // Stars
    const allPlaced = objectsPlaced >= totalObjects;
    let stars: 1 | 2 | 3;
    if (allPlaced && duration < 60) {
      stars = 3;
    } else if (allPlaced || precision >= 80) {
      stars = 2;
    } else {
      stars = 1;
    }

    // Points: 100–5000, scales with level and performance
    const multiplier = level === 1 ? 1 : level === 2 ? 1.75 : 3;
    const pointsEarned = Math.round(
      Math.max(100, Math.min(5000, (objectsPlaced * 200 + stars * 300) * multiplier))
    );

    // Training data points
    const trainingDataPoints = Math.round(objectsPlaced * 150 * multiplier + duration * 2);

    sessions.push({
      id: `session-${i.toString(36)}-${Math.floor(rng() * 10000)}`,
      date: date.toISOString(),
      level,
      duration,
      precision,
      objectsPlaced,
      totalObjects,
      pointsEarned,
      stars,
      trainingDataPoints,
    });
  }

  // Sort by date, most recent first
  sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return sessions;
}

/**
 * Get total stats from fake sessions.
 */
export function getFakeSessionStats() {
  const sessions = getFakeSessions();
  return {
    totalSessions: sessions.length,
    totalPoints: sessions.reduce((sum, s) => sum + s.pointsEarned, 0),
    totalTrainingData: sessions.reduce((sum, s) => sum + s.trainingDataPoints, 0),
    avgPrecision: Math.round(
      sessions.reduce((sum, s) => sum + s.precision, 0) / sessions.length
    ),
    avgDuration: Math.round(
      sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length
    ),
    bestStars: Math.max(...sessions.map((s) => s.stars)),
  };
}
