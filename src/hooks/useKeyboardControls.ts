// ─── PrismaX Keyboard Controls Hook ─────────────────────────────────────────
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useStore, type JointName } from "@/lib/store";

interface KeyBinding {
  joint: JointName;
  direction: 1 | -1;
}

/**
 * Key bindings map: key → which joint to move and in what direction.
 * All keys are lowercase here; we compare against event.key.toLowerCase().
 */
const KEY_BINDINGS: Record<string, KeyBinding> = {
  a: { joint: "baseRotation", direction: -1 },
  d: { joint: "baseRotation", direction: 1 },
  w: { joint: "shoulderAngle", direction: 1 },
  s: { joint: "shoulderAngle", direction: -1 },
  q: { joint: "elbowAngle", direction: -1 },
  e: { joint: "elbowAngle", direction: 1 },
  z: { joint: "wristPitch", direction: -1 },
  x: { joint: "wristPitch", direction: 1 },
  r: { joint: "wristRotation", direction: -1 },
  f: { joint: "wristRotation", direction: 1 },
};

const NORMAL_STEP = 2;    // degrees per frame
const FAST_STEP = 5;      // degrees per frame when Shift is held
const FRAME_INTERVAL = 16; // ~60fps in ms

/**
 * Hook that listens for keyboard input and continuously moves robotic arm joints.
 *
 * Controls:
 * - A/D → Base Rotation
 * - W/S → Shoulder Angle
 * - Q/E → Elbow Angle
 * - Z/X → Wrist Pitch
 * - R/F → Wrist Rotation
 * - Space → Toggle Grip
 * - H → Reset all joints to default
 *
 * Hold Shift for faster movement (5° vs 2° per frame).
 * Continuous movement while key is held using setInterval.
 *
 * @param enabled - Whether the controls are active (default true).
 *                  Disable when in menus, modals, or text inputs.
 */
export function useKeyboardControls(enabled: boolean = true) {
  // Track which keys are currently pressed
  const pressedKeys = useRef<Set<string>>(new Set());
  const shiftHeld = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Get store actions (stable references from zustand)
  const setJoint = useStore((s) => s.setJoint);
  const toggleGrip = useStore((s) => s.toggleGrip);
  const resetJoints = useStore((s) => s.resetJoints);
  const incrementJointMoves = useStore((s) => s.incrementJointMoves);

  /**
   * Process all currently held keys and apply joint movements.
   */
  const tick = useCallback(() => {
    const step = shiftHeld.current ? FAST_STEP : NORMAL_STEP;
    const joints = useStore.getState().joints;
    let movesThisTick = 0;

    for (const key of pressedKeys.current) {
      const binding = KEY_BINDINGS[key];
      if (binding) {
        const currentValue = joints[binding.joint];
        const newValue = currentValue + binding.direction * step;
        setJoint(binding.joint, newValue);
        movesThisTick++;
      }
    }

    if (movesThisTick > 0) {
      incrementJointMoves(movesThisTick);
    }
  }, [setJoint, incrementJointMoves]);

  /**
   * Start the movement loop if not already running.
   */
  const startLoop = useCallback(() => {
    if (intervalRef.current === null) {
      intervalRef.current = setInterval(tick, FRAME_INTERVAL);
    }
  }, [tick]);

  /**
   * Stop the movement loop.
   */
  const stopLoop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      // Clean up when disabled
      pressedKeys.current.clear();
      shiftHeld.current = false;
      stopLoop();
      return;
    }

    function handleKeyDown(e: KeyboardEvent) {
      // Ignore input events from text fields, textareas, etc.
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Track shift state
      if (e.key === "Shift") {
        shiftHeld.current = true;
        return;
      }

      // Toggle grip on Space (only on keydown, not repeat)
      if (key === " " && !e.repeat) {
        e.preventDefault();
        toggleGrip();
        return;
      }

      // Reset joints on H
      if (key === "h" && !e.repeat) {
        e.preventDefault();
        resetJoints();
        return;
      }

      // Movement keys
      if (KEY_BINDINGS[key] && !pressedKeys.current.has(key)) {
        e.preventDefault();
        pressedKeys.current.add(key);
        startLoop();
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      const key = e.key.toLowerCase();

      // Track shift state
      if (e.key === "Shift") {
        shiftHeld.current = false;
        return;
      }

      // Release movement key
      pressedKeys.current.delete(key);

      // Stop the loop if no movement keys are held
      if (pressedKeys.current.size === 0) {
        stopLoop();
      }
    }

    // Handle window blur (user switches tabs — release all keys)
    function handleBlur() {
      pressedKeys.current.clear();
      shiftHeld.current = false;
      stopLoop();
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      stopLoop();
      pressedKeys.current.clear();
    };
  }, [enabled, toggleGrip, resetJoints, startLoop, stopLoop]);
}

/**
 * Static reference to key binding descriptions (for UI help displays).
 */
export const KEYBOARD_HELP = [
  { keys: "A / D", action: "Base Rotation (left / right)" },
  { keys: "W / S", action: "Shoulder Angle (up / down)" },
  { keys: "Q / E", action: "Elbow Angle (contract / extend)" },
  { keys: "Z / X", action: "Wrist Pitch (down / up)" },
  { keys: "R / F", action: "Wrist Rotation (CCW / CW)" },
  { keys: "Space", action: "Toggle Gripper" },
  { keys: "H", action: "Reset All Joints" },
  { keys: "Shift + Key", action: "Faster Movement (5° per step)" },
] as const;
