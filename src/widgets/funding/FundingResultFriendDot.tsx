"use client";

import { motion } from "framer-motion";

import Profile, { getProfileColor } from "@/components/Profile";
import { cn } from "@/utils/cn";
import { isValidUrl } from "@/utils/isValidUrl";
import {
  friendDotTracks,
  friendFlightPath,
  pickFriendSpot,
} from "@/widgets/funding/fundingResultMotion";

export type ResultContributor = {
  userId: number;
  profileImageUrl?: string;
};

type FundingResultFriendDotProps = {
  index: number;
  count: number;
  contributor: ResultContributor;
};

export default function FundingResultFriendDot({
  index,
  count,
  contributor,
}: FundingResultFriendDotProps) {
  const spot = pickFriendSpot(index, count);
  const { scale, x, y, opacity, reveal } = friendDotTracks(
    index,
    friendFlightPath(index, count, spot),
  );
  const imageUrl =
    contributor.profileImageUrl && isValidUrl(contributor.profileImageUrl)
      ? contributor.profileImageUrl
      : undefined;

  return (
    <motion.div
      initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
      animate={{ scale: scale.values, x: x.values, y: y.values, opacity: opacity.values }}
      transition={{
        scale: scale.transition,
        x: x.transition,
        y: y.transition,
        opacity: opacity.transition,
      }}
      className={cn("absolute overflow-hidden rounded-full bg-[#d2d2d2]", spot.className)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: reveal.values }}
        transition={reveal.transition}
        className="absolute inset-0">
        <Profile
          imageUrl={imageUrl}
          alt=""
          color={getProfileColor(contributor.userId)}
          showIconButton={false}
          className="size-full"
        />
      </motion.div>
    </motion.div>
  );
}
