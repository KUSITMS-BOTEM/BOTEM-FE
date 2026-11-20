"use client";

import { useEffect, useSyncExternalStore } from "react";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Header from "@/components/Header";
import PageExitMotion from "@/components/effects/PageExitMotion";
import Title from "@/components/Title";
import IconClose from "@/assets/icons/icon-close.svg?react";
import { WISH_REQUEST_SENT_KEY } from "@/constants/wishRequest";
import { usePageExit } from "@/hooks/usePageExit";

const HeroMotion = dynamic(() => import("@/components/effects/hero-motion/HeroMotion"), {
  ssr: false,
});

export default function WishRequestCompleteContainer() {
  const router = useRouter();
  const { pageExit, exitPage } = usePageExit();
  const isAllowed = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        return sessionStorage.getItem(WISH_REQUEST_SENT_KEY) !== null;
      } catch {
        // 스토리지 접근이 차단되면 허용하지 않고 입력 화면으로 돌려보낸다
        return false;
      }
    },
    () => false,
  );

  // 완료 화면을 떠날 때 플래그를 지워 같은 탭에서 URL로 다시 들어와도 보이지 않게 한다
  const leave = (navigate: () => void) => {
    try {
      sessionStorage.removeItem(WISH_REQUEST_SENT_KEY);
    } catch {
      // 지우지 못해도 이동은 막지 않는다
    }
    navigate();
  };

  // 요청을 보내지 않고 URL로 직접 들어온 경우 입력 화면으로 돌려보낸다
  useEffect(() => {
    if (!isAllowed) router.replace("/wish/request");
  }, [isAllowed, router]);

  if (!isAllowed) return null;

  return (
    <PageExitMotion exit={pageExit}>
      <Header
        title=""
        rightItems={[
          {
            icon: <IconClose />,
            ariaLabel: "닫기",
            onClick: () => exitPage("fade", () => leave(() => router.replace("/home"))),
          },
        ]}
      />
      <main className="flex flex-1 flex-col gap-2 px-5">
        <Title
          type="a2z"
          title={"상품 추가 요청을\n보냈어요"}
          description={"쿠팡에 있는 상품이면\n확인 후 위시 상품에 추가해드려요"}
        />
        <div className="flex flex-1 items-center justify-center pb-40">
          <HeroMotion />
        </div>
      </main>
      <BottomCTA
        upper={
          <p className="text-semantic-text-tertiary text-center [font:var(--semantic-label-x-small-weak)]">
            기다리는동안 다른 상품을 둘러볼까요?
          </p>
        }>
        <Button
          color="brand"
          size="xlarge"
          onClick={() => leave(() => router.push("/wish/recommended"))}>
          위시 상품 둘러보기
        </Button>
      </BottomCTA>
    </PageExitMotion>
  );
}
