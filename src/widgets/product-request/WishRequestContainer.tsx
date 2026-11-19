"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import BottomCTA from "@/components/BottomCTA";
import CoupangMoveGuide from "@/components/CoupangMoveGuide";
import Header from "@/components/Header";
import PageExitMotion from "@/components/effects/PageExitMotion";
import TextField from "@/components/TextField";
import Title from "@/components/Title";
import ToastMessage from "@/components/ToastMessage";
import IconLeft from "@/assets/icons/icon-left.svg?react";
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { WISH_REQUEST_SENT_KEY } from "@/constants/wishRequest";
import { usePageExit } from "@/hooks/usePageExit";
import { useRequestProductMutation } from "@/hooks/mutations/product-request/useRequestProductMutation";
import { ApiError } from "@/types/api";
import { canSubmitWishRequest } from "@/utils/product-request/canSubmitWishRequest";
import { isCoupangProductUrl } from "@/utils/product-request/isCoupangProductUrl";

const TOAST_DURATION_MS = 2500;
const INVALID_LINK_MESSAGE = "잘못된 형식의 링크예요";

export default function WishRequestContainer() {
  const router = useRouter();
  const { pageExit, exitPage } = usePageExit();
  const { mutate: requestProduct, isPending } = useRequestProductMutation();
  const [productUrl, setProductUrl] = useState("");
  const [productName, setProductName] = useState("");
  const [toastText, setToastText] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  // 제출 이후에는 값에서 에러를 계산해, 링크를 고치면 자동으로 풀린다
  const isUrlInvalid = hasSubmitted && productUrl.trim() !== "" && !isCoupangProductUrl(productUrl);
  // 클릭 즉시 버튼을 잠가 더블클릭을 막고, 실패했을 때만 푼다(성공 시엔 화면을 떠난다)
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (!toastText) return;
    const timer = setTimeout(() => setToastText(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toastText]);

  const handleSubmit = () => {
    setHasSubmitted(true);
    if (!isCoupangProductUrl(productUrl)) return;
    setIsLocked(true);
    requestProduct(
      { productUrl: productUrl.trim(), productName: productName.trim() || null },
      {
        // 뒤로가기로 입력 폼에 돌아와 같은 요청을 다시 보내지 않도록 히스토리를 교체한다
        onSuccess: () => {
          sessionStorage.setItem(WISH_REQUEST_SENT_KEY, "1");
          router.replace("/wish/request/complete");
        },
        // inline 코드는 전역 Dialog가 띄우지 않으므로 여기서 Toast로 보여준다
        onError: error => {
          setIsLocked(false);
          if (error instanceof ApiError && ERROR_MESSAGES[error.code]?.action === "inline") {
            setToastText(ERROR_MESSAGES[error.code].message);
          }
        },
      },
    );
  };

  return (
    <PageExitMotion exit={pageExit}>
      <div className="flex flex-col">
        <Header
          title="상품 추가 요청"
          leftItem={{
            icon: <IconLeft />,
            ariaLabel: "뒤로 가기",
            onClick: () => exitPage("slide", () => router.back()),
          }}
        />
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
              error={isUrlInvalid}
              helperText={isUrlInvalid ? INVALID_LINK_MESSAGE : undefined}
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
          <CoupangMoveGuide className="mt-6" />
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
            disabled={
              !canSubmitWishRequest({ productUrl }) || isUrlInvalid || isLocked || isPending
            }
            onClick={handleSubmit}>
            요청 보내기
          </Button>
        </BottomCTA>
      </div>
    </PageExitMotion>
  );
}
