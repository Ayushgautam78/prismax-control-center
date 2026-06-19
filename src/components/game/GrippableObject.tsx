'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import type { RobotArmHandle } from './RobotArm';

interface GrippableObjectProps {
  id: string;
  color: string;
  position: [number, number, number];
  colorName: string;
  isHeld: boolean;
  isNearGripper?: boolean;
  isPlaced?: boolean;
  placedBoxPosition?: [number, number, number] | null;
  armRef?: React.RefObject<RobotArmHandle | null>;
  shape?: string;
  size?: number;
}

// ─── Dynamic shape geometry helper ──────────────────────────────────────────
function getObjectGeometry(shape: string, s: number) {
  switch (shape) {
    case 'sphere':       return <sphereGeometry args={[s * 0.5, 20, 20]} />;
    case 'cylinder':     return <cylinderGeometry args={[s * 0.35, s * 0.35, s, 16]} />;
    case 'cone':         return <coneGeometry args={[s * 0.4, s, 16]} />;
    case 'torus':        return <torusGeometry args={[s * 0.35, s * 0.12, 12, 24]} />;
    case 'dodecahedron':return <dodecahedronGeometry args={[s * 0.45]} />;
    case 'octahedron':   return <octahedronGeometry args={[s * 0.45]} />;
    case 'icosahedron':  return <icosahedronGeometry args={[s * 0.45]} />;
    case 'tetrahedron':  return <tetrahedronGeometry args={[s * 0.5]} />;
    case 'capsule':      return <capsuleGeometry args={[s * 0.25, s * 0.4, 8, 16]} />;
    case 'knot':         return <torusKnotGeometry args={[s * 0.25, s * 0.08, 64, 12]} />;
    default:             return <boxGeometry args={[s, s, s]} />;
  }
}

export default function GrippableObject({
  id,
  color,
  position,
  colorName,
  isHeld,
  isNearGripper = false,
  isPlaced = false,
  placedBoxPosition = null,
  armRef,
  shape = 'cube',
  size = 0.35,
}: GrippableObjectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const initialPos = useRef(new THREE.Vector3(...position));

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Handle placement animation (slide into box + shrink)
    if (isPlaced) {
      if (placedBoxPosition) {
        // Move towards the center bottom of the box
        const targetPos = new THREE.Vector3(
          placedBoxPosition[0],
          placedBoxPosition[1] + 0.12,
          placedBoxPosition[2]
        );
        groupRef.current.position.lerp(targetPos, 0.18);
      }
      // Shrink to 0 scale
      groupRef.current.scale.lerp(new THREE.Vector3(0, 0, 0), 0.15);
      return;
    }

    // Default kinematics (follow gripper or stay at base)
    if (isHeld && armRef?.current) {
      // Follow gripper tip when held
      const tipPos = armRef.current.getGripperTipPosition();
      groupRef.current.position.lerp(tipPos, 0.35);
    } else if (!isHeld) {
      // Return to / stay at initial position with subtle float
      groupRef.current.position.x = initialPos.current.x;
      groupRef.current.position.z = initialPos.current.z;
      groupRef.current.position.y =
        initialPos.current.y + Math.sin(t * 2 + parseInt(id.slice(-1)) * 2) * 0.03;
    }

    // Rotate when not held
    if (meshRef.current && !isHeld) {
      meshRef.current.rotation.y = t * 0.3;
    }

    // Glow pulse — brighter when near gripper
    if (glowRef.current) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      if (isNearGripper) {
        material.opacity = 0.3 + Math.sin(t * 6) * 0.15;
      } else {
        material.opacity = 0.1 + Math.sin(t * 3) * 0.05;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main object */}
      <mesh ref={meshRef} castShadow>
        {getObjectGeometry(shape, size)}
        <meshStandardMaterial
          color={color}
          metalness={0.4}
          roughness={0.3}
          envMapIntensity={1.5}
          emissive={isNearGripper ? color : '#000000'}
          emissiveIntensity={isNearGripper ? 0.3 : 0}
        />
      </mesh>

      {/* Glow ring — brighter when near gripper */}
      <mesh ref={glowRef} position={[0, -(size * 0.43), 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[size * 0.7, isNearGripper ? size * 1.3 : size, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Proximity indicator — pulsing outer ring when near */}
      {isNearGripper && !isPlaced && (
        <mesh position={[0, -(size * 0.4), 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size * 1.1, size * 1.4, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Label */}
      {!isPlaced && (
        <Text
          position={[0, size + 0.15, 0]}
          fontSize={0.12}
          color={isNearGripper ? '#ffffff' : color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {isNearGripper ? '⬆ GRIP' : colorName.toUpperCase()}
        </Text>
      )}
    </group>
  );
}
