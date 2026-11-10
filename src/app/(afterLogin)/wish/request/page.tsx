"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import BottomCTA from "@/components/BottomCTA";
import CoupangMoveGuide from "@/components/CoupangMoveGuide";
import Header from "@/components/Header";
import TextField from "@/components/TextField";
import Title from "@/components/Title";
import IconLeft from "@/assets/icons/icon-left.svg?react";
import { canSubmitWishRequest } from "./helpers";

export default function WishRequestPage() {
  const router = useRouter();
  const [productUrl, setProductUrl] = useState("");
  const [productName, setProductName] = useState("");

  return (
    <div className="flex flex-col">
      <Header
        title="상품 추가 요청"
        leftItem={{ icon: <IconLeft />, ariaLabel: "뒤로 가기", onClick: () => router.back() }}
      />
      {/* BottomCTA(fixed) 높이만큼 하단 여백을 확보해 마지막 요소가 가려지지 않게 한다 */}
      <div className="flex flex-col px-5 pb-44">
        <Title
          type="a2z"
          title={"보탬에 어떤 선물을\n추가할까요?"}
          description="갖고 싶은 상품의 링크를 붙여넣어주세요"
        />
        <div className="flex flex-col gap-3">
          <TextField
            label="상품 링크"
            placeholder="링크를 붙여넣어주세요"
            required
            autoComplete="off"
            value={productUrl}
            onChange={event => setProductUrl(event.target.value)}
          />
          <TextField
            label="상품 이름"
            placeholder="입력해주세요"
            autoComplete="off"
            value={productName}
            onChange={event => setProductName(event.target.value)}
          />
        </div>
        <CoupangMoveGuide className="mt-[15px]" />
      </div>
      <BottomCTA
        lower={
          <p className="text-semantic-text-tertiary text-center [letter-spacing:var(--letter-spacing-default)] whitespace-pre-line [font:var(--semantic-label-x-small-weak)]">
            {"쿠팡 공식 브랜드관이나 쿠팡이 직접 파는 상품만\n추가 요청 할 수 있어요."}
          </p>
        }>
        <Button
          color="brand"
          size="xlarge"
          disabled={!canSubmitWishRequest({ productUrl, productName })}>
          요청 보내기
        </Button>
      </BottomCTA>
    </div>
  );
}
