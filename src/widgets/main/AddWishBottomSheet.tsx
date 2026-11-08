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
import { resolveWishStageFlags, resolveWishStageTitle } from "@/widgets/main/helpers";

// 시트가 다 올라온 뒤(스프링 delay 0.05 + duration 0.55 ≈ 0.6s) 내부 콘텐츠가 나타나도록 지연시킨다
const EASE_STANDARD = [0.2, 0, 0, 1] as const;
const TITLE_TRANSITION = { delay: 0.6, duration: 0.45, ease: EASE_STANDARD };
const FIELD_TRANSITION = { delay: 0.9, duration: 0.4, ease: EASE_STANDARD };
const FIELD_ENTER_TRANSITION = { duration: 0.3, ease: EASE_STANDARD };
const TOAST_DURATION_MS = 2500;
const INPUT_DEBOUNCE_MS = 1000;
const PRODUCT_NAME_MAX_LENGTH = 20;
const INVALID_LINK_MESSAGE = "올바른 링크 형식이 아니에요";

type AddWishPayload = {
  productUrl: string;
  productImage: File;
  productName: string;
  price: string;
};

type AddWishBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: AddWishPayload) => void;
  className?: string;
};

export default function AddWishBottomSheet({
  open,
  onClose,
  onSubmit,
  className,
}: AddWishBottomSheetProps) {
  const [productUrl, setProductUrl] = useState("");
  const [debouncedUrl, setDebouncedUrl] = useState("");
  const [productImageUrl, setProductImageUrl] = useState<File | null>(null);
  const [productName, setProductName] = useState("");
  const [debouncedName, setDebouncedName] = useState("");
  const [price, setPrice] = useState("");
  const [toastText, setToastText] = useState<string | null>(null);

  const { isLinkValid, showNameField, showPriceField, isPriceEntered } = resolveWishStageFlags({
    debouncedUrl,
    productImageUrl,
    debouncedName,
    price,
  });

  // 입력이 멈춘 뒤 1초가 지나야 링크 형식을 검사해, 타이핑 도중에는 타이틀·AddImage·가이드·토스트가 흔들리지 않게 한다
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUrl(productUrl);
      setToastText(
        productUrl.trim().length === 0 || isValidUrl(productUrl) ? null : INVALID_LINK_MESSAGE,
      );
    }, INPUT_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [productUrl]);

  // 상품명 입력이 멈춘 뒤 1초가 지나야 가격 단계로 넘어간다
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedName(productName), INPUT_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [productName]);

  useEffect(() => {
    if (!toastText) return;
    const timer = setTimeout(() => setToastText(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toastText]);

  const handleSubmit = () => {
    if (!isValidUrl(productUrl)) {
      setToastText(INVALID_LINK_MESSAGE);
      return;
    }
    if (!productImageUrl) return;
    onSubmit({ productUrl, productImage: productImageUrl, productName, price });
  };

  const title = resolveWishStageTitle({
    isLinkValid,
    showNameField,
    showPriceField,
    isPriceEntered,
  });

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
        rightDisabled: !isPriceEntered,
      }}>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={TITLE_TRANSITION}
        className="w-full">
        <Title type="a2z" title={title} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={FIELD_TRANSITION}
        className="flex w-full flex-col gap-4">
        <AnimatePresence initial={false}>
          {showPriceField && (
            <motion.div
              key="price-field"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={FIELD_ENTER_TRANSITION}>
              <TextField
                label="가격"
                placeholder="입력해주세요"
                suffix="원"
                inputMode="numeric"
                autoComplete="off"
                value={price}
                onChange={event => setPrice(event.target.value.replace(/\D/g, ""))}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence initial={false}>
          {showNameField && (
            <motion.div
              key="name-field"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={FIELD_ENTER_TRANSITION}>
              <TextField
                label="상품명"
                placeholder="입력해주세요"
                maxLength={PRODUCT_NAME_MAX_LENGTH}
                value={productName}
                onChange={event => setProductName(event.target.value)}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence initial={false}>
          {isLinkValid && (
            <motion.div
              key="add-image"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={FIELD_ENTER_TRANSITION}>
              <AddImage value={productImageUrl} onChange={setProductImageUrl} />
            </motion.div>
          )}
        </AnimatePresence>
        <TextField
          label="상품 링크"
          placeholder="입력해주세요"
          value={productUrl}
          onChange={event => setProductUrl(event.target.value)}
        />
        <ToastMessage show={toastText !== null} text={toastText ?? ""} state={false} />
        {!isLinkValid && <CoupangMoveGuide />}
      </motion.div>
    </BottomSheet>
  );
}
