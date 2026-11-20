"use client";

import { useRouter } from "next/navigation";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Header from "@/components/Header";
import List from "@/components/List";
import PageExitMotion from "@/components/effects/PageExitMotion";
import { usePageExit } from "@/hooks/usePageExit";
import IconClose from "@/assets/icons/icon-close.svg?react";
import IconPhoto from "@/assets/icons/icon-photo.svg?react";
import IconWishAdd from "@/assets/icons/multicolor/icon-wish-add.svg?react";

type FundingGiftProofViewProps = {
  contributorCount: number;
  productName: string;
};

// proxy가 비회원의 /home 접근을 /로 보내며 쿼리도 버리므로, 링크 하나로 회원·비회원 모두 처리된다
const HOME_PATH = "/home";
const HOME_FUNDING_OPEN_PATH = "/home?open=funding";

export default function FundingGiftProofView({
  contributorCount,
  productName,
}: FundingGiftProofViewProps) {
  const router = useRouter();
  const { pageExit, exitPage } = usePageExit();

  return (
    <PageExitMotion exit={pageExit}>
      <main className="flex min-h-dvh flex-col pb-60">
        <Header
          title=""
          rightItems={[
            {
              icon: <IconClose />,
              ariaLabel: "닫기",
              onClick: () => exitPage("fade", () => router.push(HOME_PATH)),
            },
          ]}
        />
        <div className="flex flex-col gap-6 px-5 pt-2 pb-6">
          {/* TODO(API): 선물 도착 인증 사진 URL이 내려오면 이 자리에 next/image로 실제 사진을 렌더한다 */}
          <div className="bg-semantic-background-lower flex h-50 flex-col items-center justify-center gap-2 rounded-2xl">
            <IconPhoto aria-hidden className="text-semantic-icon-secondary size-8" />
            <p className="text-semantic-text-quaternary [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-subtext-medium)]">
              선물 도착 인증 사진
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-semantic-text-strong [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-title-large)]">
              이미 펀딩이 마감됐어요!
              <br />
              선물 인증이 도착했어요
            </h1>
            <p className="text-semantic-text-secondary [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-subtext-large)]">
              친구 {contributorCount}명의 보탬으로 {productName} 완성!
            </p>
          </div>
        </div>
        <BottomCTA
          upper={
            <List
              type="default"
              leading={<IconWishAdd />}
              title="나도 받고 싶은 게 있다면?"
              description="위시를 만들고 생일에 펀딩을 열어보세요"
              className="py-2"
            />
          }>
          <Button color="brand" variant="weak" size="xlarge" onClick={() => router.push(HOME_PATH)}>
            홈으로
          </Button>
          <Button color="brand" size="xlarge" onClick={() => router.push(HOME_FUNDING_OPEN_PATH)}>
            나도 만들기
          </Button>
        </BottomCTA>
      </main>
    </PageExitMotion>
  );
}
