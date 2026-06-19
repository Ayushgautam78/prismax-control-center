// ─── PrismaX Device Detection Hook ──────────────────────────────────────────
"use client";

import { useState, useEffect } from "react";

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

/**
 * Detect the current device type based on window width.
 * - Mobile: width < 768px
 * - Tablet: 768px ≤ width < 1024px
 * - Desktop: width ≥ 1024px
 *
 * Defaults to desktop during SSR to avoid layout shift on most users.
 */
export function useDeviceDetect(): DeviceInfo {
  const [device, setDevice] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    function updateDevice() {
      const width = window.innerWidth;
      setDevice({
        isMobile: width < MOBILE_BREAKPOINT,
        isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
        isDesktop: width >= TABLET_BREAKPOINT,
      });
    }

    // Initial check
    updateDevice();

    // Listen for resize events
    window.addEventListener("resize", updateDevice);
    return () => window.removeEventListener("resize", updateDevice);
  }, []);

  return device;
}
