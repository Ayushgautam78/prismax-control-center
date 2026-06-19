export interface LeaderboardEntry {
  id: string;
  name: string;
  totalPoints: number;
  levelsCompleted: number;
  bestTime: number;
  accuracy: number;
  levelTitle: string;
  badge: string;
  isCurrentUser?: boolean;
  rank: number;
}

const FAKE_NAMES = [
  'AlphaBot_7', 'TeleOp_Master', 'CyberArm_99', 'RoboNinja_42', 'NeuralOp_13',
  'QuantumGrip_8', 'MechPilot_23', 'ArmWizard_55', 'SyncBot_77', 'PrecisionX_31',
  'RoboAce_14', 'GripMaster_66', 'JointRunner_9', 'ControlFreak_88', 'ServoKing_45',
  'PickBot_22', 'PlaceHero_67', 'TrainedArm_19', 'OptiGrip_34', 'FlexBot_91',
  'DataHarvest_5', 'TelePath_28', 'ArmadaX_73', 'GripForce_16', 'SmoothOp_82',
  'TorqueMax_37', 'CalibBot_60', 'PhysicsAI_11', 'NanoGrip_48', 'ProtoArm_95',
  'SignalBot_26', 'WaveForm_71', 'AxisPrime_3', 'TensorGrip_58', 'RoboElite_84',
  'CoreSync_39', 'DeltaArm_62', 'VectorBot_17', 'PulseGrip_90', 'FrameOp_44',
  'GridMaster_29', 'ByteArm_76', 'NovaGrip_52', 'ZenithBot_8', 'SteadyOp_63',
  'IronGrip_35', 'TitanArm_21', 'SwiftBot_87', 'OmegaOp_46', 'PhantomGrip_15',
  'NexusArm_70', 'EchoBot_33', 'MatrixGrip_96', 'CometOp_57', 'ShadowArm_12',
  'ThunderGrip_78', 'ApexBot_41', 'ZeroLatency_69', 'HyperArm_24', 'BladeOp_93',
  'FusionGrip_36', 'SparkBot_81', 'RiftArm_54', 'StormOp_18', 'GlitchGrip_65',
  'VoltBot_47', 'NeonArm_72', 'CipherOp_30', 'FluxGrip_86', 'DawnBot_53',
  'HazeArm_10', 'CruxOp_79', 'DriftGrip_43', 'PrismBot_68', 'ShardArm_25',
  'BoltOp_92', 'EmberGrip_38', 'ViperBot_61', 'CosmicArm_16', 'ZoneOp_85',
  'AuraGrip_50', 'NovaBot_74', 'PhaseArm_27', 'SurgeOp_97', 'CrestGrip_40',
  'LoopBot_64', 'PeakArm_32', 'WarpOp_89', 'CoreGrip_56', 'MeshBot_20',
  'ArcArm_75', 'PulseOp_49', 'LinkGrip_83', 'NodeBot_13', 'SpecArm_59',
  'WaveOp_94', 'GateGrip_37', 'ChipBot_80', 'LineArm_51', 'FlowOp_6',
];

function getLevelTitle(points: number): { title: string; badge: string } {
  if (points >= 40000) return { title: 'Legend', badge: '👑' };
  if (points >= 25000) return { title: 'Elite', badge: '💎' };
  if (points >= 15000) return { title: 'Expert', badge: '🏆' };
  if (points >= 8000) return { title: 'Operator', badge: '⭐' };
  if (points >= 3000) return { title: 'Pilot', badge: '🎯' };
  return { title: 'Rookie', badge: '🔰' };
}

// Seeded random for consistent fake data
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const FAKE_ENTRIES: LeaderboardEntry[] = FAKE_NAMES.map((name, i) => {
  const seed = i * 7919 + 42;
  const points = Math.floor(seededRandom(seed) * 47000) + 500;
  const { title, badge } = getLevelTitle(points);

  return {
    id: `fake-${i}`,
    name,
    totalPoints: points,
    levelsCompleted: Math.min(3, Math.floor(seededRandom(seed + 1) * 3) + 1),
    bestTime: Math.floor(seededRandom(seed + 2) * 160) + 20,
    accuracy: Math.floor(seededRandom(seed + 3) * 35) + 65,
    levelTitle: title,
    badge,
  };
}).sort((a, b) => b.totalPoints - a.totalPoints)
  .map((entry, idx) => ({ ...entry, rank: idx + 1 } as LeaderboardEntry));

export function getUserRank(userPoints: number = 0): number {
  const index = FAKE_ENTRIES.findIndex((e) => userPoints >= e.totalPoints);
  if (index === -1) return FAKE_ENTRIES.length + 1;
  return index + 1;
}

export function getLeaderboard(
  userName?: string,
  userPoints?: number
): LeaderboardEntry[] {
  const name = userName || 'You';
  const points = userPoints || 0;
  const { title, badge } = getLevelTitle(points);

  const userEntry: LeaderboardEntry = {
    id: 'current-user',
    name: name,
    totalPoints: points,
    levelsCompleted: 0,
    bestTime: 0,
    accuracy: 0,
    levelTitle: title,
    badge,
    isCurrentUser: true,
    rank: 0,
  };

  // Merge user into fake entries
  const all = [...FAKE_ENTRIES, userEntry]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  return all;
}

export { FAKE_ENTRIES };
