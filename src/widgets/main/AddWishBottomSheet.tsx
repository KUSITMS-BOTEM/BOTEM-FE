"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";

import BottomSheet from "@/components/BottomSheet";
import TextField from "@/components/TextField";
import Title from "@/components/Title";
import ToastMessage from "@/components/ToastMessage";
import { isValidUrl } from "@/utils/isValidUrl";
import CoupangMoveGuide from "@/widgets/main/CoupangMoveGuide";

// 시트가 다 올라온 뒤(스프링 delay 0.05 + duration 0.55 ≈ 0.6s) 내부 콘텐츠가 나타나도록 지연시킨다
const EASE_STANDARD = [0.2, 0, 0, 1] as const;
const TITLE_TRANSITION = { delay: 0.6, duration: 0.45, ease: EASE_STANDARD };
const FIELD_TRANSITION = { delay: 0.9, duration: 0.4, ease: EASE_STANDARD };
const TOAST_DURATION_MS = 2500;

type AddWishBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (productLink: string) => void;
  className?: string;
};

export default function AddWishBottomSheet({
  open,
  onClose,
  onSubmit,
  className,
}: AddWishBottomSheetProps) {
  const [productLink, setProductLink] = useState("");
  const [toastText, setToastText] = useState<string | null>(null);

  useEffect(() => {
    if (!toastText) return;
    const timer = setTimeout(() => setToastText(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toastText]);

  const handleSubmit = () => {
    if (!isValidUrl(productLink)) {
      setToastText("올바른 링크 형식이 아니에요");
      return;
    }
    onSubmit(productLink);
  };

  return (
    <BottomSheet
      open={open}
      title="위시 추가"
      height="max"
      onClose={onClose}
      className={className}
      buttons={{
        rightLabel: "추가하기",
        onRightClick: handleSubmit,
        rightDisabled: productLink.trim().length === 0,
      }}>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={TITLE_TRANSITION}
        className="w-full">
        <Title type="a2z" title={"갖고 싶은 상품 링크를\n넣어주세요"} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={FIELD_TRANSITION}
        className="flex w-full flex-col gap-4">
        <TextField
          label="상품 링크"
          placeholder="입력해주세요"
          value={productLink}
          onChange={event => setProductLink(event.target.value)}
        />
        <ToastMessage show={toastText !== null} text={toastText ?? ""} state={false} />
        {!isValidUrl(productLink) && <CoupangMoveGuide />}
      </motion.div>
    </BottomSheet>
  );
}
