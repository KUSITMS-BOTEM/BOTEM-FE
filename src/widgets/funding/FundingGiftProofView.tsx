"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Header from "@/components/Header";
import Tooltip from "@/components/Tooltip";
import PageExitMotion from "@/components/effects/PageExitMotion";
import { useKakaoLoginUriMutation } from "@/hooks/mutations/auth/useKakaoLoginUriMutation";
import { usePageExit } from "@/hooks/usePageExit";
import { handleKakaoLoginClick } from "@/utils/auth/handleKakaoLoginClick";
import { isValidUrl } from "@/utils/isValidUrl";
import IconClose from "@/assets/icons/icon-close.svg?react";

type FundingGiftProofViewProps = {
  imageUrl: string;
  contributorCount: number;
  productName: string;
  isLoggedIn: boolean;
};

// proxy가 비회원의 /home 접근을 /로 보내며 쿼리도 버리므로, 링크 하나로 회원·비회원 모두 처리된다
const HOME_PATH = "/home";
const HOME_FUNDING_OPEN_PATH = "/home?open=funding";

export default function FundingGiftProofView({
  imageUrl,
  contributorCount,
  productName,
  isLoggedIn,
}: FundingGiftProofViewProps) {
  const router = useRouter();
  const { pageExit, exitPage } = usePageExit();
  const { mutate: requestKakaoLogin } = useKakaoLoginUriMutation();
  const tooltip = <Tooltip direction="down">나도 받고 싶은게 있다면?</Tooltip>;

  return (
    <PageExitMotion exit={pageExit}>
      <main className="flex min-h-dvh flex-col pb-40">
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
        <div className="flex flex-col gap-4 px-5 pb-6">
          <div className="border-semantic-border-default rounded-xxx-large relative aspect-square w-full overflow-hidden border">
            {isValidUrl(imageUrl) && (
              <Image
                src={imageUrl}
                alt="선물 도착 인증 사진"
                fill
                unoptimized
                priority
                className="object-cover"
              />
            )}
          </div>
          <div className="flex flex-col gap-2 [letter-spacing:var(--letter-spacing-default)]">
            <h1 className="text-semantic-text-strong [font:var(--semantic-title-large)]">
              이미 펀딩이 마감됐어요!
              <br />
              선물 인증이 도착했어요
            </h1>
            <p className="text-semantic-text-secondary [font:var(--semantic-subtext-large)]">
              친구 {contributorCount}명의 보탬으로
              <br />
              {productName} 완성!
            </p>
          </div>
        </div>
        {isLoggedIn ? (
          <BottomCTA tooltip={tooltip}>
            <Button color="brand" size="xlarge" onClick={() => router.push(HOME_FUNDING_OPEN_PATH)}>
              위시 추가하고 펀딩 열기
            </Button>
          </BottomCTA>
        ) : (
          <BottomCTA
            type="kakao"
            tooltip={tooltip}
            onClick={() => handleKakaoLoginClick(requestKakaoLogin, HOME_FUNDING_OPEN_PATH)}
          />
        )}
      </main>
    </PageExitMotion>
  );
}
