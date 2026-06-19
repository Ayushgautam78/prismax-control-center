'use client';

import React, { useRef, useMemo, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/lib/store';

// ─── Arm Segment Dimensions ─────────────────────────────────────────────────
const BASE_RADIUS = 0.3;
const BASE_HEIGHT = 0.15;
const SHOULDER_HEIGHT = 0.12;
const UPPER_ARM_LENGTH = 1.0;
const UPPER_ARM_RADIUS = 0.07;
const FOREARM_LENGTH = 0.8;
const FOREARM_RADIUS = 0.055;
const WRIST_LENGTH = 0.3;
const WRIST_RADIUS = 0.04;
const GRIPPER_LENGTH = 0.25;
const GRIPPER_WIDTH = 0.03;
const JOINT_RADIUS = 0.09;

// ─── Materials ──────────────────────────────────────────────────────────────
function useArmMaterials() {
  return useMemo(() => ({
    darkMetal: new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.9,
      roughness: 0.15,
      envMapIntensity: 1.5,
    }),
    bodyMetal: new THREE.MeshStandardMaterial({
      color: 0x2d2d2d,
      metalness: 0.85,
      roughness: 0.2,
      envMapIntensity: 1.2,
    }),
    goldAccent: new THREE.MeshStandardMaterial({
      color: 0xc5974b,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xc5974b,
      emissiveIntensity: 0.15,
      envMapIntensity: 1.5,
    }),
    jointMetal: new THREE.MeshStandardMaterial({
      color: 0x3a3a3a,
      metalness: 0.8,
      roughness: 0.25,
      envMapIntensity: 1.0,
    }),
    gripperMetal: new THREE.MeshStandardMaterial({
      color: 0xc5974b,
      metalness: 0.85,
      roughness: 0.15,
      emissive: 0xc5974b,
      emissiveIntensity: 0.1,
      envMapIntensity: 1.3,
    }),
  }), []);
}

// ─── Joint Component ────────────────────────────────────────────────────────
function JointSphere({ radius, material }: { radius: number; material: THREE.Material }) {
  return (
    <mesh castShadow>
      <sphereGeometry args={[radius, 16, 16]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

// ─── Arm Segment ────────────────────────────────────────────────────────────
function ArmSegment({
  length,
  radius,
  material,
  accentMaterial,
}: {
  length: number;
  radius: number;
  material: THREE.Material;
  accentMaterial: THREE.Material;
}) {
  return (
    <group>
      {/* Main cylinder */}
      <mesh castShadow position={[0, length / 2, 0]}>
        <cylinderGeometry args={[radius, radius, length, 12]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Gold accent ring at midpoint */}
      <mesh position={[0, length / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius + 0.005, 0.008, 8, 24]} />
        <primitive object={accentMaterial} attach="material" />
      </mesh>
    </group>
  );
}

// ─── Gripper Finger ─────────────────────────────────────────────────────────
function GripperFinger({
  side,
  openAmount,
  material,
}: {
  side: 1 | -1;
  openAmount: number;
  material: THREE.Material;
}) {
  const spread = (openAmount / 100) * 0.08 + 0.02;
  return (
    <group position={[side * spread, 0, 0]}>
      {/* Finger base */}
      <mesh castShadow position={[0, GRIPPER_LENGTH / 2, 0]}>
        <boxGeometry args={[GRIPPER_WIDTH, GRIPPER_LENGTH, GRIPPER_WIDTH * 1.5]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Finger tip (angled inward) */}
      <mesh
        castShadow
        position={[side * -0.01, GRIPPER_LENGTH, 0]}
        rotation={[0, 0, side * 0.3]}
      >
        <boxGeometry args={[GRIPPER_WIDTH * 0.8, GRIPPER_LENGTH * 0.4, GRIPPER_WIDTH * 1.2]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

// ─── Exported gripper tip ref type ──────────────────────────────────────────
export interface RobotArmHandle {
  getGripperTipPosition: () => THREE.Vector3;
}

// ─── Main Robot Arm ─────────────────────────────────────────────────────────
interface RobotArmProps {
  autoRotate?: boolean;
  showControls?: boolean;
  activeCamera?: string;
}

const RobotArm = forwardRef<RobotArmHandle, RobotArmProps>(function RobotArm(
  { autoRotate = false, activeCamera = 'default' },
  ref
) {
  const groupRef = useRef<THREE.Group>(null);
  const gripperTipRef = useRef<THREE.Object3D>(null);
  const mats = useArmMaterials();

  const {
    baseRotation,
    shoulderAngle,
    elbowAngle,
    wristPitch,
    wristRotation,
    gripperOpen,
  } = useGameStore();

  // Expose gripper tip world position for collision detection
  useImperativeHandle(ref, () => ({
    getGripperTipPosition: () => {
      if (gripperTipRef.current) {
        const pos = new THREE.Vector3();
        gripperTipRef.current.updateMatrixWorld(true);
        gripperTipRef.current.getWorldPosition(pos);
        return pos;
      }
      return new THREE.Vector3(0, 1, 0);
    },
  }));

  // Idle breathing animation
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    if (autoRotate) {
      groupRef.current.rotation.y += delta * 0.15;
    } else {
      const t = state.clock.elapsedTime;
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.01;
    }
  });

  const baseRad = THREE.MathUtils.degToRad(baseRotation);
  const shoulderRad = THREE.MathUtils.degToRad(shoulderAngle);
  const elbowRad = THREE.MathUtils.degToRad(elbowAngle);
  const wristPitchRad = THREE.MathUtils.degToRad(wristPitch);
  const wristRotRad = THREE.MathUtils.degToRad(wristRotation);

  return (
    <group ref={groupRef}>
      {/* ── Base Platform ──────────────────────────────────── */}
      <group>
        {/* Base cylinder */}
        <mesh castShadow receiveShadow position={[0, BASE_HEIGHT / 2, 0]}>
          <cylinderGeometry args={[BASE_RADIUS, BASE_RADIUS + 0.05, BASE_HEIGHT, 24]} />
          <primitive object={mats.darkMetal} attach="material" />
        </mesh>
        {/* Gold ring on base */}
        <mesh position={[0, BASE_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[BASE_RADIUS - 0.02, 0.012, 8, 32]} />
          <primitive object={mats.goldAccent} attach="material" />
        </mesh>

        {/* ── Rotating Column (yaw) ──────────────────────── */}
        <group position={[0, BASE_HEIGHT, 0]} rotation={[0, baseRad, 0]}>
          {/* Shoulder housing */}
          <mesh castShadow position={[0, SHOULDER_HEIGHT / 2, 0]}>
            <cylinderGeometry args={[0.12, BASE_RADIUS - 0.05, SHOULDER_HEIGHT, 16]} />
            <primitive object={mats.bodyMetal} attach="material" />
          </mesh>

          {/* ── Shoulder Joint (pitch) ────────────────────── */}
          <group position={[0, SHOULDER_HEIGHT, 0]}>
            <JointSphere radius={JOINT_RADIUS} material={mats.jointMetal} />

            <group rotation={[0, 0, shoulderRad]}>
              {/* Upper Arm */}
              <ArmSegment
                length={UPPER_ARM_LENGTH}
                radius={UPPER_ARM_RADIUS}
                material={mats.bodyMetal}
                accentMaterial={mats.goldAccent}
              />

              {/* ── Elbow Joint (pitch) ────────────────────── */}
              <group position={[0, UPPER_ARM_LENGTH, 0]}>
                <JointSphere radius={JOINT_RADIUS * 0.85} material={mats.jointMetal} />

                <group rotation={[0, 0, elbowRad]}>
                  {/* Forearm */}
                  <ArmSegment
                    length={FOREARM_LENGTH}
                    radius={FOREARM_RADIUS}
                    material={mats.bodyMetal}
                    accentMaterial={mats.goldAccent}
                  />

                  {/* ── Wrist Joint (pitch + roll) ──────────── */}
                  <group position={[0, FOREARM_LENGTH, 0]}>
                    <JointSphere radius={JOINT_RADIUS * 0.7} material={mats.goldAccent} />

                    <group rotation={[0, wristRotRad, wristPitchRad]}>
                      {/* Wrist segment */}
                      <mesh castShadow position={[0, WRIST_LENGTH / 2, 0]}>
                        <cylinderGeometry args={[WRIST_RADIUS, WRIST_RADIUS + 0.01, WRIST_LENGTH, 10]} />
                        <primitive object={mats.bodyMetal} attach="material" />
                      </mesh>

                      {/* ── Gripper ──────────────────────────── */}
                      <group position={[0, WRIST_LENGTH, 0]}>
                        {/* Gripper mount */}
                        <mesh castShadow>
                          <cylinderGeometry args={[0.04, 0.035, 0.04, 10]} />
                          <primitive object={mats.darkMetal} attach="material" />
                        </mesh>

                        {/* Fingers */}
                        <GripperFinger side={1} openAmount={gripperOpen} material={mats.gripperMetal} />
                        <GripperFinger side={-1} openAmount={gripperOpen} material={mats.gripperMetal} />

                        {/* First-person Gripper hand camera view */}
                        {activeCamera === 'gripper' && (
                          <PerspectiveCamera
                            makeDefault
                            position={[0, 0.06, 0.06]} // Look right from the palm/fingers area
                            rotation={[-Math.PI / 2, 0, 0]} // Point straight down along the arm/finger path
                            fov={65}
                            near={0.02}
                            far={15}
                          />
                        )}

                        {/* Gripper tip marker (invisible — used for position tracking) */}
                        <object3D ref={gripperTipRef} position={[0, GRIPPER_LENGTH * 0.8, 0]} />
                      </group>
                    </group>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
});

export default RobotArm;
