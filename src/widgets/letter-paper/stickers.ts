import type { FunctionComponent, SVGProps } from "react";

import StickerCake from "@/assets/icons/multicolor/sticker-cake.svg?react";
import StickerGift from "@/assets/icons/multicolor/sticker-gift.svg?react";
import StickerHbd from "@/assets/icons/multicolor/sticker-hbd.svg?react";
import StickerHeart from "@/assets/icons/multicolor/sticker-heart.svg?react";
import StickerPartyPopper from "@/assets/icons/multicolor/sticker-party-popper.svg?react";
import StickerSmile from "@/assets/icons/multicolor/sticker-smile.svg?react";
import StickerSparkles from "@/assets/icons/multicolor/sticker-sparkles.svg?react";
import StickerThumbsUp from "@/assets/icons/multicolor/sticker-thumbs-up.svg?react";

export type Sticker = {
  id: string;
  Icon: FunctionComponent<SVGProps<SVGSVGElement>>;
};

export const STICKERS: Sticker[] = [
  { id: "heart", Icon: StickerHeart },
  { id: "party-popper", Icon: StickerPartyPopper },
  { id: "gift", Icon: StickerGift },
  { id: "sparkles", Icon: StickerSparkles },
  { id: "cake", Icon: StickerCake },
  { id: "thumbs-up", Icon: StickerThumbsUp },
  { id: "smile", Icon: StickerSmile },
  { id: "hbd", Icon: StickerHbd },
];
