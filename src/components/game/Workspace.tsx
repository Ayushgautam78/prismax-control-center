'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';

export default function Workspace() {
  const tableRef = useRef<THREE.Group>(null);

  return (
    <group ref={tableRef}>
      {/* Main table surface */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[6, 0.2, 4]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.8}
          roughness={0.2}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Golden edge trim - front */}
      <mesh position={[0, -0.05, 2.05]} receiveShadow>
        <boxGeometry args={[6.1, 0.08, 0.08]} />
        <meshStandardMaterial
          color="#C5974B"
          metalness={0.9}
          roughness={0.1}
          emissive="#C5974B"
          emissiveIntensity={0.2}
        />
      </mesh>
      {/* Golden edge trim - back */}
      <mesh position={[0, -0.05, -2.05]} receiveShadow>
        <boxGeometry args={[6.1, 0.08, 0.08]} />
        <meshStandardMaterial
          color="#C5974B"
          metalness={0.9}
          roughness={0.1}
          emissive="#C5974B"
          emissiveIntensity={0.2}
        />
      </mesh>
      {/* Golden edge trim - left */}
      <mesh position={[-3.05, -0.05, 0]} receiveShadow>
        <boxGeometry args={[0.08, 0.08, 4.1]} />
        <meshStandardMaterial
          color="#C5974B"
          metalness={0.9}
          roughness={0.1}
          emissive="#C5974B"
          emissiveIntensity={0.2}
        />
      </mesh>
      {/* Golden edge trim - right */}
      <mesh position={[3.05, -0.05, 0]} receiveShadow>
        <boxGeometry args={[0.08, 0.08, 4.1]} />
        <meshStandardMaterial
          color="#C5974B"
          metalness={0.9}
          roughness={0.1}
          emissive="#C5974B"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Table legs */}
      {[
        [-2.7, -0.7, 1.7],
        [2.7, -0.7, 1.7],
        [-2.7, -0.7, -1.7],
        [2.7, -0.7, -1.7],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 1, 8]} />
          <meshStandardMaterial
            color="#2a2a2a"
            metalness={0.9}
            roughness={0.15}
          />
        </mesh>
      ))}

      {/* Holographic grid on table surface */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.8, 3.8]} />
        <meshBasicMaterial
          color="#C5974B"
          transparent
          opacity={0.03}
          wireframe
        />
      </mesh>
    </group>
  );
}
