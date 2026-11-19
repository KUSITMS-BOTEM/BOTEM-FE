"use client";

import type { StaticImageData } from "next/image";

import FundingResultConfettiPiece from "@/widgets/funding/FundingResultConfettiPiece";
import FundingResultFriendDot, {
  type ResultContributor,
} from "@/widgets/funding/FundingResultFriendDot";
import FundingResultWishPhoto from "@/widgets/funding/FundingResultWishPhoto";
import { CONFETTI_PIECES, MAX_FRIENDS } from "@/widgets/funding/fundingResultMotion";

type FundingResultCelebrationProps = {
  productImage?: string | StaticImageData;
  contributors: ResultContributor[];
  reduceMotion: boolean;
};

// 보탠 친구들이 하나씩 날아와 회색 위시 사진을 한 조각씩 컬러로 채우고, 사진이 튀어 오르며 컨페티가 터진다
export default function FundingResultCelebration({
  productImage,
  contributors,
  reduceMotion,
}: FundingResultCelebrationProps) {
  const friends = contributors.slice(0, MAX_FRIENDS);

  return (
    <div aria-hidden className="flex h-50 w-full justify-center overflow-x-clip">
      <div className="relative h-full w-[333px] shrink-0">
        {!reduceMotion && (
          <>
            {CONFETTI_PIECES.map((piece, index) => (
              <FundingResultConfettiPiece key={index} piece={piece} />
            ))}
            {friends.map((contributor, index) => (
              <FundingResultFriendDot
                key={contributor.userId}
                index={index}
                count={friends.length}
                contributor={contributor}
              />
            ))}
          </>
        )}
        <FundingResultWishPhoto
          productImage={productImage}
          sliceCount={friends.length}
          reduceMotion={reduceMotion}
        />
      </div>
    </div>
  );
}
