"use client";

import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import BottomCTA from "@/components/BottomCTA";
import CoupangMoveGuide from "@/components/CoupangMoveGuide";
import Header from "@/components/Header";
import TextField from "@/components/TextField";
import Title from "@/components/Title";
import ToastMessage from "@/components/ToastMessage";
import IconLeft from "@/assets/icons/icon-left.svg?react";
import { useRequestProductMutation } from "@/hooks/mutations/productRequest/useRequestProductMutation";
import { canSubmitWishRequest } from "@/utils/product-request/canSubmitWishRequest";
import { isCoupangProductUrl } from "@/utils/product-request/isCoupangProductUrl";

const TOAST_DURATION_MS = 2500;
const INVALID_LINK_MESSAGE = "링크 형식이 잘못됐어요";

export default function WishRequestContainer() {
  const router = useRouter();
  const { mutate: requestProduct, isPending } = useRequestProductMutation();
  const [productUrl, setProductUrl] = useState("");
  const [productName, setProductName] = useState("");
  const [toastText, setToastText] = useState<string | null>(null);
  // isPending은 비동기로 갱신돼 빠른 더블클릭을 막지 못하므로 ref로 동기 잠금
  const isSubmitting = useRef(false);

  useEffect(() => {
    if (!toastText) return;
    const timer = setTimeout(() => setToastText(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toastText]);

  const handleSubmit = () => {
    if (isSubmitting.current) return;
    if (!isCoupangProductUrl(productUrl)) {
      setToastText(INVALID_LINK_MESSAGE);
      return;
    }
    isSubmitting.current = true;
    requestProduct(
      { productUrl: productUrl.trim(), productName: productName.trim() || null },
      {
        // 성공 시 이동할 전용 페이지가 있지만 디자인이 아직 나오지 않아 만들지 못했다 — 임시로 /wish/recommended로 이동한다
        onSuccess: () => router.push("/wish/recommended"),
        onSettled: () => {
          isSubmitting.current = false;
        },
      },
    );
  };

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
          <ToastMessage show={toastText !== null} text={toastText ?? ""} state={false} />
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
          disabled={!canSubmitWishRequest({ productUrl }) || isPending}
          onClick={handleSubmit}>
          요청 보내기
        </Button>
      </BottomCTA>
    </div>
  );
}
