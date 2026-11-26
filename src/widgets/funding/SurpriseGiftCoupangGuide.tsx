import Image from "next/image";

import { isValidUrl } from "@/utils/isValidUrl";
import CoupangGift from "@/assets/images/surprise-gift/coupang-gift.svg?react";
import CoupangRating from "@/assets/images/surprise-gift/coupang-rating.svg?react";
import IconShare from "@/assets/icons/icon-share.svg?react";
import ProfileOrange from "@/assets/icons/multicolor/profile-orange.svg?react";

type SurpriseGiftCoupangGuideProps = {
  productImageUrl: string;
  productName: string;
  sellerName: string | null;
};

// 쿠팡 상품 화면을 본뜬 안내 그림. 사진 아래 선물 버튼 위치를 알려 주는 용도라 상품 사진·판매처만 실제 값이다
export default function SurpriseGiftCoupangGuide({
  productImageUrl,
  productName,
  sellerName,
}: SurpriseGiftCoupangGuideProps) {
  return (
    <figure className="flex h-78 w-[295px] flex-col items-center justify-between">
      <div className="border-semantic-fill-neutral-weak bg-semantic-fill-default relative h-[278px] w-full overflow-clip rounded-t-[30px] border">
        <div className="bg-base-gray-200 absolute -top-px -left-px h-[213px] w-[294px]">
          {isValidUrl(productImageUrl) && (
            <Image
              src={productImageUrl}
              alt={productName}
              fill
              unoptimized
              className="object-cover"
            />
          )}
        </div>
        <div
          aria-hidden
          className="absolute top-[251px] -left-px flex w-[294px] items-center justify-between px-4">
          <div className="from-semantic-fill-default absolute -top-[9px] left-0 h-[35px] w-full -scale-y-100 bg-linear-to-b to-transparent" />
          <div className="relative flex items-center gap-1.5">
            <ProfileOrange className="size-9 shrink-0" />
            {sellerName && (
              <div className="text-base-gray-700 flex flex-col leading-[1.252] tracking-(--letter-spacing-default)">
                <span className="text-[13px] font-semibold">{sellerName}</span>
                <span className="text-[10px]">브랜드샵</span>
              </div>
            )}
          </div>
          <div className="relative flex items-center gap-1">
            <CoupangRating />
            <span className="text-[7.742px] leading-[1.252] text-black underline">25</span>
          </div>
        </div>
        <div
          aria-hidden
          className="bg-semantic-fill-brand/20 absolute top-[220px] left-[219px] size-8 rounded-[8.533px]"
        />
        <CoupangGift
          aria-hidden
          className="text-semantic-text-primary absolute top-[227px] left-[226px]"
        />
        <IconShare
          aria-hidden
          className="text-semantic-text-primary absolute top-[226.2px] left-[257.2px] size-[21.6px]"
        />
      </div>
      <figcaption className="bg-semantic-fill-neutral-weak text-semantic-text-primary rounded-medium flex w-full items-center justify-center px-2 py-1 tracking-(--letter-spacing-default) [font:var(--semantic-label-x-small)]">
        쿠팡 제품 사진 하단의 선물 버튼을 통해 선물할 수 있어요
      </figcaption>
    </figure>
  );
}
