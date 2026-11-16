"use client";

import { motion } from "framer-motion";
import ConfettiBit from "@/components/effects/ConfettiBit";
import { cn } from "@/utils/cn";
import { toMotion, type HeroParticle } from "./heroMotionTrack";

const COLOR: Record<HeroParticle["c"], string> = {
  orange: "bg-base-orange-500",
  blue: "bg-base-blue-500",
  lime: "bg-base-lime-500",
  pink: "bg-base-pink-500",
};

type HeroConfettiProps = {
  particle: HeroParticle;
};

export default function HeroConfetti({ particle }: HeroConfettiProps) {
  const { k, c, p, ...tracks } = particle;

  return (
    <motion.div {...toMotion(tracks)} className={cn("absolute origin-center", p)}>
      <ConfettiBit kind={k} className={cn("size-full", COLOR[c])} />
    </motion.div>
  );
}
