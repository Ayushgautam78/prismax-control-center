'use client';

import React, { Suspense, useState, useCallback, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Grid,
  Html,
} from '@react-three/drei';
import RobotArm, { type RobotArmHandle } from './RobotArm';
import Workspace from './Workspace';
import GrippableObject from './GrippableObject';
import DropBox from './DropBox';
import ControlHints from './ControlHints';
import CameraPresetSwitcher, { type CameraPresetName } from './CameraPresetSwitcher';
import { useGameStore } from '@/lib/store';
import * as THREE from 'three';

// ─── Loading Screen ─────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-[#C5974B]/30 border-t-[#C5974B] rounded-full animate-spin" />
        <p className="text-[#C5974B] font-medium text-lg animate-pulse">
          Loading Robot Model...
        </p>
      </div>
    </Html>
  );
}

// ─── Level Configs ──────────────────────────────────────────────────────────
interface ObjectConfig {
  id: string;
  color: string;
  position: [number, number, number];
  colorName: string;
  shape?: string;
  size?: number;
}

interface BoxConfig {
  id: string;
  color: string;
  position: [number, number, number];
  label: string;
  acceptColor?: string;
}

function getLevelConfig(level: number): {
  objects: ObjectConfig[];
  boxes: BoxConfig[];
} {
  switch (level) {
    case 1:
      return {
        objects: [
          { id: 'obj1', color: '#D4A853', position: [1.0, 0.22, 0.8], colorName: 'gold' },
          { id: 'obj2', color: '#C5974B', position: [1.5, 0.22, 0.3], colorName: 'amber' },
          { id: 'obj3', color: '#D4A853', position: [1.0, 0.22, -0.3], colorName: 'gold' },
          { id: 'obj4', color: '#C5974B', position: [1.5, 0.22, -0.8], colorName: 'amber' },
          { id: 'obj5', color: '#D4A853', position: [1.8, 0.22, 0.0], colorName: 'gold' },
        ],
        boxes: [
          { id: 'box1', color: '#C5974B', position: [-1.5, 0, 0], label: 'DROP HERE' },
        ],
      };
    case 2:
      return {
        objects: [
          { id: 'obj1',  color: '#ef4444', position: [0.8, 0.22, 1.0],  colorName: 'red',    shape: 'cube',         size: 0.30 },
          { id: 'obj2',  color: '#3b82f6', position: [1.4, 0.22, 1.0],  colorName: 'blue',   shape: 'sphere',       size: 0.32 },
          { id: 'obj3',  color: '#22c55e', position: [2.0, 0.22, 1.0],  colorName: 'green',  shape: 'cylinder',     size: 0.28 },
          { id: 'obj4',  color: '#f59e0b', position: [0.8, 0.22, 0.3],  colorName: 'amber',  shape: 'cone',         size: 0.30 },
          { id: 'obj5',  color: '#8b5cf6', position: [1.4, 0.22, 0.3],  colorName: 'purple', shape: 'torus',        size: 0.35 },
          { id: 'obj6',  color: '#ec4899', position: [2.0, 0.22, 0.3],  colorName: 'pink',   shape: 'dodecahedron', size: 0.28 },
          { id: 'obj7',  color: '#06b6d4', position: [0.8, 0.22, -0.4], colorName: 'cyan',   shape: 'octahedron',   size: 0.30 },
          { id: 'obj8',  color: '#f97316', position: [1.4, 0.22, -0.4], colorName: 'orange', shape: 'icosahedron',  size: 0.28 },
          { id: 'obj9',  color: '#D4A853', position: [0.8, 0.22, -1.1], colorName: 'gold',   shape: 'tetrahedron',  size: 0.32 },
          { id: 'obj10', color: '#64748b', position: [1.4, 0.22, -1.1], colorName: 'slate',  shape: 'knot',         size: 0.30 },
        ],
        boxes: [
          { id: 'box1', color: '#C5974B', position: [-1.5, 0, 0.5],  label: 'DROP HERE' },
          { id: 'box2', color: '#C5974B', position: [-1.5, 0, -0.5], label: 'DROP HERE' },
        ],
      };
    case 3:
      return {
        objects: [
          // 18 colored blocks (6 red, 6 blue, 6 green) — shuffled across rows
          { id: 'obj1',  color: '#ef4444', position: [0.6, 0.18, 1.2],  colorName: 'red',   size: 0.22 },
          { id: 'obj2',  color: '#3b82f6', position: [1.2, 0.18, 1.2],  colorName: 'blue',  size: 0.22 },
          { id: 'obj3',  color: '#22c55e', position: [1.8, 0.18, 1.2],  colorName: 'green', size: 0.22 },
          { id: 'obj4',  color: '#3b82f6', position: [0.6, 0.18, 0.72], colorName: 'blue',  size: 0.22 },
          { id: 'obj5',  color: '#22c55e', position: [1.2, 0.18, 0.72], colorName: 'green', size: 0.22 },
          { id: 'obj6',  color: '#ef4444', position: [1.8, 0.18, 0.72], colorName: 'red',   size: 0.22 },
          { id: 'obj7',  color: '#22c55e', position: [0.6, 0.18, 0.24], colorName: 'green', size: 0.22 },
          { id: 'obj8',  color: '#ef4444', position: [1.2, 0.18, 0.24], colorName: 'red',   size: 0.22 },
          { id: 'obj9',  color: '#3b82f6', position: [1.8, 0.18, 0.24], colorName: 'blue',  size: 0.22 },
          { id: 'obj10', color: '#ef4444', position: [0.6, 0.18, -0.24], colorName: 'red',  size: 0.22 },
          { id: 'obj11', color: '#3b82f6', position: [1.2, 0.18, -0.24], colorName: 'blue', size: 0.22 },
          { id: 'obj12', color: '#22c55e', position: [1.8, 0.18, -0.24], colorName: 'green',size: 0.22 },
          { id: 'obj13', color: '#3b82f6', position: [0.6, 0.18, -0.72], colorName: 'blue', size: 0.22 },
          { id: 'obj14', color: '#22c55e', position: [1.2, 0.18, -0.72], colorName: 'green',size: 0.22 },
          { id: 'obj15', color: '#ef4444', position: [1.8, 0.18, -0.72], colorName: 'red',  size: 0.22 },
          { id: 'obj16', color: '#22c55e', position: [0.6, 0.18, -1.2],  colorName: 'green',size: 0.22 },
          { id: 'obj17', color: '#ef4444', position: [1.2, 0.18, -1.2],  colorName: 'red',  size: 0.22 },
          { id: 'obj18', color: '#3b82f6', position: [1.8, 0.18, -1.2],  colorName: 'blue', size: 0.22 },
        ],
        boxes: [
          { id: 'box1', color: '#ef4444', position: [-1.5, 0, 0.9],  label: 'RED',   acceptColor: 'red' },
          { id: 'box2', color: '#3b82f6', position: [-1.5, 0, 0],    label: 'BLUE',  acceptColor: 'blue' },
          { id: 'box3', color: '#22c55e', position: [-1.5, 0, -0.9], label: 'GREEN', acceptColor: 'green' },
        ],
      };
    default:
      return { objects: [], boxes: [] };
  }
}

// ─── Proximity threshold constants ──────────────────────────────────────────
const GRIP_PROXIMITY = 1.2;     // generous pickup radius
const DROP_PROXIMITY = 2.0;      // very forgiving drop radius

// ─── Camera presets ─────────────────────────────────────────────────────────
const CAMERA_PRESETS: Record<Exclude<CameraPresetName, 'gripper'>, { position: [number, number, number]; target: [number, number, number] }> = {
  default: { position: [3, 3.5, 4], target: [0, 1, 0] },
  top: { position: [0, 5.5, 0.01], target: [0, 0, 0] },
  front: { position: [0, 2.2, 4.5], target: [0, 1, 0] },
  side: { position: [4.5, 2.2, 0], target: [0, 1, 0] },
  closeup: { position: [1.8, 1.8, 1.8], target: [0.8, 0.4, 0.3] },
};

// ─── Camera Controller Component ───────────────────────────────────────────
function CameraController({
  preset,
  controlsRef,
}: {
  preset: CameraPresetName;
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(...CAMERA_PRESETS.default.position));
  const targetLook = useRef(new THREE.Vector3(...CAMERA_PRESETS.default.target));
  const isTransitioning = useRef(false);

  useEffect(() => {
    if (preset === 'gripper') {
      isTransitioning.current = false;
      return;
    }
    const config = CAMERA_PRESETS[preset];
    if (config) {
      targetPos.current.set(...config.position);
      targetLook.current.set(...config.target);
      isTransitioning.current = true;
    }
  }, [preset]);

  useFrame(() => {
    if (!isTransitioning.current) return;

    const step = 0.08; // smooth transition speed
    camera.position.lerp(targetPos.current, step);

    if (controlsRef.current) {
      const currentTarget = controlsRef.current.target;
      currentTarget.lerp(targetLook.current, step);
      controlsRef.current.update();
    }

    if (camera.position.distanceTo(targetPos.current) < 0.02) {
      camera.position.copy(targetPos.current);
      if (controlsRef.current) {
        controlsRef.current.target.copy(targetLook.current);
        controlsRef.current.update();
      }
      isTransitioning.current = false;
    }
  });

  return null;
}

// ─── Collision System ───────────────────────────────────────────────────────
function CollisionSystem({
  armRef,
  objects,
  boxes,
  placedObjects,
  onObjectPlace,
  onNearObject,
  onNearBox,
  level,
}: {
  armRef: React.RefObject<RobotArmHandle | null>;
  objects: ObjectConfig[];
  boxes: BoxConfig[];
  placedObjects: Record<string, [number, number, number]>;
  onObjectPlace: (objectId: string, boxPosition: [number, number, number]) => void;
  onNearObject: (objectId: string | null) => void;
  onNearBox: (boxId: string | null) => void;
  level: number;
}) {
  const store = useGameStore;
  const prevGripping = useRef(false);

  useFrame(() => {
    if (!armRef.current) return;
    const gripperPos = armRef.current.getGripperTipPosition();
    const state = store.getState();
    const { isGripping, heldObjectId, phase } = state;

    if (phase !== 'playing') return;

    // ── Find nearest unplaced object ──
    let nearestObj: string | null = null;
    let nearestObjDist = Infinity;

    for (const obj of objects) {
      if (obj.id in placedObjects) continue;
      if (heldObjectId === obj.id) continue;

      const objPos = new THREE.Vector3(...obj.position);
      const dist = gripperPos.distanceTo(objPos);
      if (dist < GRIP_PROXIMITY && dist < nearestObjDist) {
        nearestObj = obj.id;
        nearestObjDist = dist;
      }
    }
    onNearObject(nearestObj);

    // ── Find nearest box ──
    let nearestBox: string | null = null;
    let nearestBoxDist = Infinity;

    for (const box of boxes) {
      const boxCenter = new THREE.Vector3(box.position[0], box.position[1] + 0.3, box.position[2]);
      const dist = gripperPos.distanceTo(boxCenter);
      if (dist < DROP_PROXIMITY && dist < nearestBoxDist) {
        nearestBox = box.id;
        nearestBoxDist = dist;
      }
    }
    onNearBox(nearestBox);

    // ── Grip transition detection ──
    const justGripped = isGripping && !prevGripping.current;
    const justReleased = !isGripping && prevGripping.current;
    prevGripping.current = isGripping;

    // ── Pick up object ──
    if (justGripped && !heldObjectId && nearestObj) {
      store.getState().setHeldObject(nearestObj);
      console.log(`[Grip] Picked up object ${nearestObj} at distance ${nearestObjDist.toFixed(3)}`);
    }

    // ── Drop / place object ──
    if (justReleased && heldObjectId) {
      console.log(`[Release] Releasing object ${heldObjectId}. Nearest box: ${nearestBox || 'None'} (dist: ${nearestBoxDist.toFixed(3)})`);
      // Check if over a box
      if (nearestBox) {
        const box = boxes.find(b => b.id === nearestBox);
        const heldObj = objects.find(o => o.id === heldObjectId);

        if (box && heldObj) {
          // Level 3: color matching required
          if (level === 3 && box.acceptColor) {
            if (heldObj.colorName === box.acceptColor) {
              onObjectPlace(heldObjectId, box.position);
              store.getState().addScore(200);
              console.log(`[Drop] Successfully dropped object ${heldObjectId} inside box ${nearestBox}`);
            } else {
              console.log(`[Drop Failed] Color mismatch. Object color: ${heldObj.colorName}, Box accepts: ${box.acceptColor}`);
            }
            // Wrong color — just release, no score
          } else {
            // Level 1 & 2: any box works
            onObjectPlace(heldObjectId, box.position);
            store.getState().addScore(200);
            console.log(`[Drop] Successfully dropped object ${heldObjectId} inside box ${nearestBox}`);
          }
        }
      } else {
        console.log(`[Drop Failed] Not close enough to any box. Proximity: ${nearestBoxDist.toFixed(3)} (required: < ${DROP_PROXIMITY})`);
      }
      // Release the object regardless
      store.getState().setHeldObject(null);
    }
  });

  return null;
}

// ─── GameScene ──────────────────────────────────────────────────────────────
interface GameSceneProps {
  level: number;
}

export default function GameScene({ level }: GameSceneProps) {
  const { phase, heldObjectId, isGripping } = useGameStore();
  const config = getLevelConfig(level);
  const armRef = useRef<RobotArmHandle>(null);
  const controlsRef = useRef<any>(null);

  // placedObjects tracks objectId to placed box positions
  const [placedObjects, setPlacedObjects] = useState<Record<string, [number, number, number]>>({});
  const [nearObject, setNearObject] = useState<string | null>(null);
  const [nearBox, setNearBox] = useState<string | null>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraPresetName>('default');

  const handleObjectPlace = useCallback((objectId: string, boxPosition: [number, number, number]) => {
    setPlacedObjects(prev => ({
      ...prev,
      [objectId]: boxPosition,
    }));
    useGameStore.getState().placeObject();
  }, []);

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        camera={{ position: [3, 3.5, 4], fov: 50 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#0a0a0a']} />

        {/* Camera Preset Controller */}
        <CameraController preset={cameraPreset} controlsRef={controlsRef} />

        {/* Fog for depth */}
        <fog attach="fog" args={['#0a0a0a', 8, 20]} />

        {/* Lighting */}
        <ambientLight intensity={0.4} color="#D4A853" />
        <directionalLight
          position={[5, 8, 3]}
          intensity={1.5}
          color="#ffffff"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />
        <spotLight
          position={[-3, 6, -2]}
          intensity={0.8}
          color="#C5974B"
          angle={0.5}
          penumbra={0.5}
          castShadow
        />
        <spotLight
          position={[3, 5, -3]}
          intensity={0.4}
          color="#D4A853"
          angle={0.6}
          penumbra={0.8}
        />
        <pointLight position={[0, 4, 0]} intensity={0.3} color="#C5974B" />

        <Suspense fallback={<LoadingScreen />}>
          {/* Environment for reflections */}
          <Environment preset="city" background={false} />

          {/* Robot Arm with attached hand camera when selected */}
          <RobotArm ref={armRef} autoRotate={false} activeCamera={cameraPreset} />

          {/* Workspace Table */}
          <Workspace />

          {/* Grippable Objects */}
          {config.objects.map((obj) => (
            <GrippableObject
              key={obj.id}
              id={obj.id}
              color={obj.color}
              position={obj.position}
              colorName={obj.colorName}
              isHeld={heldObjectId === obj.id}
              isNearGripper={nearObject === obj.id}
              isPlaced={obj.id in placedObjects}
              placedBoxPosition={placedObjects[obj.id] || null}
              armRef={armRef}
              shape={obj.shape}
              size={obj.size}
            />
          ))}

          {/* Drop Boxes */}
          {config.boxes.map((box) => (
            <DropBox
              key={box.id}
              id={box.id}
              color={box.color}
              position={box.position}
              label={box.label}
              acceptColor={box.acceptColor}
              onDrop={(objId) => handleObjectPlace(objId, box.position)}
              isHighlighted={nearBox === box.id && heldObjectId !== null}
            />
          ))}

          {/* Collision System */}
          {phase === 'playing' && (
            <CollisionSystem
              armRef={armRef}
              objects={config.objects}
              boxes={config.boxes}
              placedObjects={placedObjects}
              onObjectPlace={handleObjectPlace}
              onNearObject={setNearObject}
              onNearBox={setNearBox}
              level={level}
            />
          )}

          {/* Ground Grid */}
          <Grid
            position={[0, -0.01, 0]}
            args={[20, 20]}
            cellSize={0.5}
            cellThickness={0.5}
            cellColor="#C5974B"
            sectionSize={2}
            sectionThickness={1}
            sectionColor="#916E2B"
            fadeDistance={15}
            fadeStrength={1.5}
            infiniteGrid
          />

          {/* Contact Shadows */}
          <ContactShadows
            position={[0, 0.01, 0]}
            opacity={0.4}
            scale={10}
            blur={2}
            far={4}
            color="#000000"
          />
        </Suspense>

        {/* Camera Controls - Disabled for hand camera */}
        {cameraPreset !== 'gripper' && (
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={10}
            minPolarAngle={0.2}
            maxPolarAngle={Math.PI / 2 - 0.1}
            target={[0, 1, 0]}
            dampingFactor={0.05}
            enableDamping
          />
        )}
      </Canvas>

      {/* Dynamic Contextual Hints Overlay */}
      {phase === 'playing' && (
        <ControlHints
          isHoldingObject={heldObjectId !== null}
          nearObject={nearObject !== null}
          nearBox={nearBox !== null}
          isGripping={isGripping}
          objectsPlaced={Object.keys(placedObjects).length}
          totalObjects={config.objects.length}
        />
      )}

      {/* Camera angle switching widget */}
      {phase === 'playing' && (
        <CameraPresetSwitcher
          activePreset={cameraPreset}
          onPresetChange={setCameraPreset}
        />
      )}
    </div>
  );
}
