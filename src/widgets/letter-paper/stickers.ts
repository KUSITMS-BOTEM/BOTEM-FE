import type { FunctionComponent, SVGProps } from "react";

import StickerCake from "@/assets/icons/multicolor/sticker-cake.svg?react";
import StickerCrown from "@/assets/icons/multicolor/sticker-crown.svg?react";
import StickerGift from "@/assets/icons/multicolor/sticker-gift.svg?react";
import StickerHbd from "@/assets/icons/multicolor/sticker-hbd.svg?react";
import StickerHeart from "@/assets/icons/multicolor/sticker-heart.svg?react";
import StickerPartyPopper from "@/assets/icons/multicolor/sticker-party-popper.svg?react";
import StickerSmile from "@/assets/icons/multicolor/sticker-smile.svg?react";
import StickerSparkles from "@/assets/icons/multicolor/sticker-sparkles.svg?react";
import StickerThumbsUp from "@/assets/icons/multicolor/sticker-thumbs-up.svg?react";

export type Sticker = {
  id: string;
  label: string;
  Icon: FunctionComponent<SVGProps<SVGSVGElement>>;
};

export const STICKERS: Sticker[] = [
  { id: "heart", label: "하트", Icon: StickerHeart },
  { id: "party-popper", label: "파티 폭죽", Icon: StickerPartyPopper },
  { id: "gift", label: "선물", Icon: StickerGift },
  { id: "sparkles", label: "반짝이", Icon: StickerSparkles },
  { id: "cake", label: "케이크", Icon: StickerCake },
  { id: "thumbs-up", label: "엄지 척", Icon: StickerThumbsUp },
  { id: "smile", label: "웃는 얼굴", Icon: StickerSmile },
  { id: "hbd", label: "생일 축하", Icon: StickerHbd },
  { id: "crown", label: "왕관", Icon: StickerCrown },
];
