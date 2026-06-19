// ─── PrismaX Telemetry Simulator ────────────────────────────────────────────

export interface TelemetryData {
  motorTemp: number;       // 40–85 °C
  torque: number;          // 0–15 Nm
  current: number;         // 0.5–3.5 A
  aiConfidence: number;    // 75–99 %
  smoothness: number;      // 60–98 %
  latency: number;         // 5–45 ms
  dataRate: number;        // 100–200 samples/sec
  stability: number;       // 70–99 %
  voltage: number;         // 11.5–12.6 V
  cpu: number;             // 30–80 %
  gpu: number;             // 20–70 %
  memory: number;          // 40–75 %
  packetLoss: number;      // 0–2 %
}

// Internal state for smooth jittering — values drift rather than jump randomly
const state: TelemetryData = {
  motorTemp: 58,
  torque: 7.2,
  current: 1.8,
  aiConfidence: 91,
  smoothness: 82,
  latency: 18,
  dataRate: 152,
  stability: 88,
  voltage: 12.1,
  cpu: 52,
  gpu: 41,
  memory: 55,
  packetLoss: 0.3,
};

/**
 * Apply a small random drift to a value, clamped within [min, max].
 * `jitter` controls max drift per tick.
 */
function drift(current: number, min: number, max: number, jitter: number): number {
  const delta = (Math.random() - 0.5) * 2 * jitter;
  const next = current + delta;
  return Math.min(max, Math.max(min, next));
}

/**
 * Round a number to N decimal places.
 */
function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Generate a telemetry snapshot with realistically fluctuating values.
 * Each call drifts slightly from the previous — suitable for calling at
 * 1–10 Hz to feed dashboard gauges and charts.
 */
export function generateTelemetry(): TelemetryData {
  state.motorTemp   = drift(state.motorTemp, 40, 85, 1.5);
  state.torque      = drift(state.torque, 0, 15, 0.8);
  state.current     = drift(state.current, 0.5, 3.5, 0.15);
  state.aiConfidence = drift(state.aiConfidence, 75, 99, 1.2);
  state.smoothness  = drift(state.smoothness, 60, 98, 1.5);
  state.latency     = drift(state.latency, 5, 45, 2.5);
  state.dataRate    = drift(state.dataRate, 100, 200, 5);
  state.stability   = drift(state.stability, 70, 99, 1.0);
  state.voltage     = drift(state.voltage, 11.5, 12.6, 0.05);
  state.cpu         = drift(state.cpu, 30, 80, 2.0);
  state.gpu         = drift(state.gpu, 20, 70, 1.5);
  state.memory      = drift(state.memory, 40, 75, 0.8);
  state.packetLoss  = drift(state.packetLoss, 0, 2, 0.15);

  return {
    motorTemp:    round(state.motorTemp, 1),
    torque:       round(state.torque, 2),
    current:      round(state.current, 2),
    aiConfidence: round(state.aiConfidence, 1),
    smoothness:   round(state.smoothness, 1),
    latency:      round(state.latency, 1),
    dataRate:     round(state.dataRate, 0),
    stability:    round(state.stability, 1),
    voltage:      round(state.voltage, 2),
    cpu:          round(state.cpu, 1),
    gpu:          round(state.gpu, 1),
    memory:       round(state.memory, 1),
    packetLoss:   round(state.packetLoss, 2),
  };
}

/**
 * Get a severity label for motor temperature.
 */
export function getMotorTempSeverity(temp: number): "normal" | "warm" | "hot" | "critical" {
  if (temp < 55) return "normal";
  if (temp < 70) return "warm";
  if (temp < 80) return "hot";
  return "critical";
}

/**
 * Get a quality label for AI confidence.
 */
export function getAIQualityLabel(confidence: number): string {
  if (confidence >= 95) return "Excellent";
  if (confidence >= 85) return "Good";
  if (confidence >= 75) return "Fair";
  return "Poor";
}

/**
 * Get a latency quality label.
 */
export function getLatencyLabel(latency: number): "excellent" | "good" | "fair" | "poor" {
  if (latency < 10) return "excellent";
  if (latency < 20) return "good";
  if (latency < 35) return "fair";
  return "poor";
}
