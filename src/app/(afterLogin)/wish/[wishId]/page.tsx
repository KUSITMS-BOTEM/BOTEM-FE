"use client";

import { useState } from "react";

import Image from "next/image";

import { useRouter } from "next/navigation";

import { faker } from "@faker-js/faker";

import Asset from "@/components/Asset";
import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Dialog from "@/components/Dialog";
import Header from "@/components/Header";
import List from "@/components/List";
import ListText from "@/components/ListText";
import IconDelete from "@/assets/icons/icon-delete.svg?react";
import IconInfo from "@/assets/icons/icon-info.svg?react";
import IconLeft from "@/assets/icons/icon-left.svg?react";
import IconRight from "@/assets/icons/icon-right.svg?react";

// TODO: 위시 상세 조회 MSW 핸들러 연동 전까지 하드코딩. faker.seed로 고정해 서버/클라이언트 렌더 값이 어긋나지 않게 함
faker.seed(1);
const MOCK_WISH = {
  productName: "소니 WH-1000XM5",
  price: 429000,
  productImageUrl: faker.image.urlPicsumPhotos({
    width: 720,
    height: 720,
    grayscale: false,
    blur: 0,
  }),
  sellerName: "쿠팡 Apple 공식 브랜드관",
  productLink: "https://www.coupang.com/vp/products/7891234567",
};

export default function WishDetail() {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <div className="flex flex-col">
      <div className="relative aspect-square w-full shrink-0">
        <Image
          src={MOCK_WISH.productImageUrl}
          alt={MOCK_WISH.productName}
          fill
          unoptimized
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-b from-black/0 from-[84.444%] to-black/20 to-[160.69%]"
        />
        <Header
          title="위시 상품"
          background="none"
          leftItem={{ icon: <IconLeft />, ariaLabel: "뒤로 가기", onClick: () => router.back() }}
          rightItems={[
            {
              icon: <IconDelete />,
              ariaLabel: "삭제",
              onClick: () => setIsDeleteDialogOpen(true),
            },
          ]}
          className="absolute inset-x-0 top-0 bg-linear-to-b from-white from-[29.297%] to-white/0 to-[195.31%]"
        />
      </div>
      <div className="flex flex-col gap-3 px-5 pt-5">
        <div className="flex w-full flex-col gap-2">
          <ListText
            title={`${MOCK_WISH.price.toLocaleString("ko-KR")}원`}
            description={MOCK_WISH.productName}
            titleUp
            type="price"
          />
          <div className="bg-semantic-fill-neutral-weak rounded-large flex items-center gap-1 p-3">
            <Asset icon={<IconInfo />} size="xsmall" className="text-semantic-icon-default" />
            <p className="text-semantic-text-secondary [font:var(--semantic-subtext-medium)]">
              실제 가격은 구매할 때 달라질 수 있어요
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.open(MOCK_WISH.productLink, "_blank", "noopener,noreferrer")}
          className="w-full text-left">
          <List
            title={MOCK_WISH.sellerName}
            description="판매처"
            titleUp
            right={
              <Asset icon={<IconRight />} size="small" className="text-semantic-icon-default" />
            }
          />
        </button>
        <div className="flex w-full flex-col items-center pt-10">
          <div className="to-semantic-fill-neutral-weak -mx-5 flex w-[calc(100%+40px)] flex-col gap-6 bg-linear-to-b from-transparent to-[27.355%] px-5 py-8">
            <p className="text-semantic-text-primary [font:var(--semantic-label-x-small)]">Logo</p>
            <p className="text-semantic-text-secondary [font:var(--semantic-subtext-small)]">
              쿠팡 파트너스의 일환으로,
              <br />
              이에 따른 일정액의 수수료를 제공 받습니다.
            </p>
          </div>
        </div>
      </div>
      {/* 하단 고정 BottomCTA(그라데이션 36px + padding-large + 버튼 56px)에 콘텐츠가 가려지지 않도록 같은 높이만큼 스크롤 여백 확보 */}
      <div
        aria-hidden
        className="h-[calc(36px+var(--padding-large)+56px+env(safe-area-inset-bottom))]"
      />
      <BottomCTA>
        <Button color="brand" size="xlarge">
          펀딩 열기
        </Button>
      </BottomCTA>
      <Dialog
        open={isDeleteDialogOpen}
        kind="confirm"
        title="내 위시에서 제거할까요?"
        description="위시 추가는 다시 할 수 있어요"
        confirmColor="danger"
        // TODO: 위시 삭제 API 연동 전까지 다이얼로그만 닫음
        onConfirm={() => setIsDeleteDialogOpen(false)}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
