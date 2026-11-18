"use client";

import { useState } from "react";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import List from "@/components/List";
import TextArea from "@/components/TextArea";
import Title from "@/components/Title";
import { withObjectParticle } from "@/utils/withSubjectParticle";
import AddImage from "@/widgets/wish/AddImage";

// 선물 인증 이미지 업로드 API가 허용하는 형식·용량
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const THANK_YOU_MESSAGE_MAX_LENGTH = 80;

export type GiftVerifySubmitValues = { image: File; thankYouMessage: string };

type FundingGiftVerifyViewProps = {
  productName: string;
  productImageUrl: string;
  isSubmitting: boolean;
  onSubmit: (values: GiftVerifySubmitValues) => void;
};

export default function FundingGiftVerifyView({
  productName,
  productImageUrl,
  isSubmitting,
  onSubmit,
}: FundingGiftVerifyViewProps) {
  const [image, setImage] = useState<File | null>(null);
  const [thankYouMessage, setThankYouMessage] = useState("");
  const canSubmit = image !== null && thankYouMessage.length <= THANK_YOU_MESSAGE_MAX_LENGTH;

  return (
    <>
      <div className="flex flex-col gap-3 px-5 pb-40">
        <div className="flex flex-col">
          <Title type="a2z" title={"보태준 친구들에게\n선물 도착 인증을 해볼까요?"} />
          <List
            type="product"
            thumbnailSrc={productImageUrl}
            thumbnailAlt={productName}
            titleUp
            description="위시 상품이였던"
            title={`${withObjectParticle(productName)} 받았어요`}
          />
        </div>
        <AddImage
          label="인증 사진"
          value={image}
          onChange={setImage}
          allowedTypes={ALLOWED_IMAGE_TYPES}
          maxSizeBytes={MAX_IMAGE_SIZE_BYTES}
        />
        <TextArea
          label="감사 메세지"
          placeholder="예: 덕분에 잘 쓸게 고마워!"
          value={thankYouMessage}
          onChange={event => setThankYouMessage(event.target.value)}
          onClear={() => setThankYouMessage("")}
          maxLength={THANK_YOU_MESSAGE_MAX_LENGTH}
        />
      </div>
      <BottomCTA>
        <Button
          color="brand"
          size="xlarge"
          disabled={!canSubmit || isSubmitting}
          states={isSubmitting ? "loading" : "default"}
          onClick={() => image && onSubmit({ image, thankYouMessage })}>
          선물 도착 인증 보내기
        </Button>
      </BottomCTA>
    </>
  );
}
