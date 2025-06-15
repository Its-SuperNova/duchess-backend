"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

export default function SplashScreen({
  onAnimationComplete,
}: SplashScreenProps) {
  const [phase, setPhase] = useState<
    "initial" | "logos-fade-in" | "background-to-white" | "fade-out"
  >("initial");

  useEffect(() => {
    // Phase 1: Initial brown background (already set by default)

    // Phase 2: Logos fade in after 2 seconds
    const timer1 = setTimeout(() => {
      setPhase("logos-fade-in");
    }, 2000); // 2 seconds initial delay

    // Phase 3: Background changes to white after logos fade in (0.5s) + brief pause (0.5s)
    const timer2 = setTimeout(() => {
      setPhase("background-to-white");
    }, 2000 + 500 + 500); // 2s (initial) + 0.5s (logo fade duration) + 0.5s (pause)

    // Phase 4: Entire splash screen fades out after background changes (0.5s) + brief pause (0.5s)
    const timer3 = setTimeout(() => {
      setPhase("fade-out");
    }, 2000 + 500 + 500 + 500 + 500); // 3s (until background changes) + 0.5s (background transition) + 0.5s (pause)

    // Final callback after all animations complete
    const timer4 = setTimeout(() => {
      onAnimationComplete();
    }, 2000 + 500 + 500 + 500 + 500 + 500); // Total duration: 4s + 0.5s (final fade-out) = 4.5s

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onAnimationComplete]);

  // Determine background color based on phase
  const backgroundColor =
    phase === "background-to-white" || phase === "fade-out"
      ? "#ffffff"
      : "#7a0000";

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{
        opacity: phase === "fade-out" ? 0 : 1,
        backgroundColor: backgroundColor,
      }}
      transition={{
        opacity: { duration: 0.5 },
        backgroundColor: {
          duration: 0.5,
          delay: phase === "background-to-white" ? 0 : 0,
        }, // Smooth transition for background color
      }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden" // No border-radius
    >
      {/* Logos */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity:
            phase === "logos-fade-in" || phase === "background-to-white"
              ? 1
              : 0,
        }}
        transition={{ duration: 0.5 }}
        className="relative flex flex-col items-center justify-center z-10"
      >
        <Image
          src="/images/Logo/icon.png" // Cake slice icon
          alt="Duchess Cake Icon"
          width={100}
          height={100}
          priority
          className="mb-4"
        />
        <Image
          src="/images/Logo/name.png" // Duchess text logo
          alt="Duchess Logo Text"
          width={200}
          height={60}
          priority
        />
      </motion.div>
    </motion.div>
  );
}
