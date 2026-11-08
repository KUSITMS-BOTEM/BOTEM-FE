"use client";

import { useEffect, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import BottomSheet from "@/components/BottomSheet";
import TextField from "@/components/TextField";
import Title from "@/components/Title";
import ToastMessage from "@/components/ToastMessage";
import { isValidUrl } from "@/utils/isValidUrl";
import AddImage from "@/widgets/main/AddImage";
import CoupangMoveGuide from "@/widgets/main/CoupangMoveGuide";

// 시트가 다 올라온 뒤(스프링 delay 0.05 + duration 0.55 ≈ 0.6s) 내부 콘텐츠가 나타나도록 지연시킨다
const EASE_STANDARD = [0.2, 0, 0, 1] as const;
const TITLE_TRANSITION = { delay: 0.6, duration: 0.45, ease: EASE_STANDARD };
const FIELD_TRANSITION = { delay: 0.9, duration: 0.4, ease: EASE_STANDARD };
const TOAST_DURATION_MS = 2500;
const LINK_CHECK_DEBOUNCE_MS = 1000;
const INVALID_LINK_MESSAGE = "올바른 링크 형식이 아니에요";

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
  const [debouncedLink, setDebouncedLink] = useState("");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [toastText, setToastText] = useState<string | null>(null);

  const isLinkValid = debouncedLink.trim().length > 0 && isValidUrl(debouncedLink);

  // 입력이 멈춘 뒤 1초가 지나야 링크 형식을 검사해, 타이핑 도중에는 타이틀·AddImage·가이드·토스트가 흔들리지 않게 한다
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLink(productLink);
      setToastText(
        productLink.trim().length === 0 || isValidUrl(productLink) ? null : INVALID_LINK_MESSAGE,
      );
    }, LINK_CHECK_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [productLink]);

  useEffect(() => {
    if (!toastText) return;
    const timer = setTimeout(() => setToastText(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toastText]);

  const handleSubmit = () => {
    if (!isValidUrl(productLink)) {
      setToastText(INVALID_LINK_MESSAGE);
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
        <Title
          type="a2z"
          title={isLinkValid ? "상품 사진을\n추가해주세요" : "갖고 싶은 상품 링크를\n넣어주세요"}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={FIELD_TRANSITION}
        className="flex w-full flex-col gap-4">
        <AnimatePresence initial={false}>
          {isLinkValid && (
            <motion.div
              key="add-image"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: EASE_STANDARD }}>
              <AddImage value={productImage} onChange={setProductImage} />
            </motion.div>
          )}
        </AnimatePresence>
        <TextField
          label="상품 링크"
          placeholder="입력해주세요"
          value={productLink}
          onChange={event => setProductLink(event.target.value)}
        />
        <ToastMessage show={toastText !== null} text={toastText ?? ""} state={false} />
        {!isLinkValid && <CoupangMoveGuide />}
      </motion.div>
    </BottomSheet>
  );
}
