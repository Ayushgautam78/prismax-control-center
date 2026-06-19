'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface DropBoxProps {
  id: string;
  color: string;
  position: [number, number, number];
  label: string;
  acceptColor?: string;
  onDrop: (objectId: string) => void;
  isHighlighted?: boolean;
}

export default function DropBox({
  id,
  color,
  position,
  label,
  acceptColor,
  onDrop,
  isHighlighted = false,
}: DropBoxProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Subtle glow animation — brighter when highlighted
  useFrame((state) => {
    if (glowRef.current) {
      const t = state.clock.elapsedTime;
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      if (isHighlighted) {
        material.opacity = 0.2 + Math.sin(t * 5) * 0.1;
      } else {
        material.opacity = 0.08 + Math.sin(t * 2) * 0.04;
      }
    }
  });

  const wallThickness = 0.04;
  const boxW = 0.7;
  const boxH = 0.5;
  const boxD = 0.7;

  const wallColor = isHighlighted ? color : '#222222';
  const wallOpacity = isHighlighted ? 0.85 : 0.6;
  const emissiveIntensity = isHighlighted ? 0.8 : 0.5;

  return (
    <group ref={groupRef} position={position}>
      {/* Bottom */}
      <mesh position={[0, wallThickness / 2, 0]} receiveShadow>
        <boxGeometry args={[boxW, wallThickness, boxD]} />
        <meshStandardMaterial
          color={isHighlighted ? color : '#1a1a1a'}
          metalness={0.8}
          roughness={0.2}
          emissive={isHighlighted ? color : '#000000'}
          emissiveIntensity={isHighlighted ? 0.2 : 0}
        />
      </mesh>

      {/* Front wall */}
      <mesh position={[0, boxH / 2, boxD / 2]} receiveShadow>
        <boxGeometry args={[boxW, boxH, wallThickness]} />
        <meshStandardMaterial
          color={wallColor}
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={wallOpacity}
        />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, boxH / 2, -boxD / 2]} receiveShadow>
        <boxGeometry args={[boxW, boxH, wallThickness]} />
        <meshStandardMaterial
          color={wallColor}
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Left wall */}
      <mesh position={[-boxW / 2, boxH / 2, 0]} receiveShadow>
        <boxGeometry args={[wallThickness, boxH, boxD]} />
        <meshStandardMaterial
          color={wallColor}
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Right wall */}
      <mesh position={[boxW / 2, boxH / 2, 0]} receiveShadow>
        <boxGeometry args={[wallThickness, boxH, boxD]} />
        <meshStandardMaterial
          color={wallColor}
          metalness={0.7}
          roughness={0.3}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Colored trim on top edges */}
      {/* Front */}
      <mesh position={[0, boxH, boxD / 2]}>
        <boxGeometry args={[boxW + 0.02, 0.03, 0.03]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      {/* Back */}
      <mesh position={[0, boxH, -boxD / 2]}>
        <boxGeometry args={[boxW + 0.02, 0.03, 0.03]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      {/* Left */}
      <mesh position={[-boxW / 2, boxH, 0]}>
        <boxGeometry args={[0.03, 0.03, boxD + 0.02]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      {/* Right */}
      <mesh position={[boxW / 2, boxH, 0]}>
        <boxGeometry args={[0.03, 0.03, boxD + 0.02]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Glow indicator on bottom */}
      <mesh ref={glowRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[boxW - 0.1, boxD - 0.1]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
        />
      </mesh>

      {/* Highlight beacon when object is nearby */}
      {isHighlighted && (
        <mesh position={[0, boxH + 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 0.35, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Label */}
      <Text
        position={[0, boxH + 0.15, 0]}
        fontSize={0.13}
        color={isHighlighted ? '#ffffff' : color}
        anchorX="center"
        anchorY="middle"
        fontWeight={700}
        outlineWidth={0.005}
        outlineColor="#000000"
      >
        {isHighlighted ? '⬇ DROP HERE' : label}
      </Text>
    </group>
  );
}
