"use client";

import { type FocusEvent, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import OpenSheet from "@/components/OpenSheet";
import Title from "@/components/Title";
import type { Color } from "@/constants/color";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { cn } from "@/utils/cn";
import { withVocativeParticle } from "@/utils/withSubjectParticle";
import ScaledLetterPaper from "@/widgets/letter-paper/ScaledLetterPaper";
import LetterRecordSheet from "@/widgets/letter-paper/LetterRecordSheet";
import LetterToolSheet from "@/widgets/letter-paper/LetterToolSheet";
import LetterWriteBody from "@/widgets/letter-paper/LetterWriteBody";
import PaletteArea from "@/widgets/letter-paper/PaletteArea";
import StickerSheet from "@/widgets/letter-paper/StickerSheet";
import { STICKERS, type Sticker } from "@/widgets/letter-paper/stickers";

// 시트가 이미 떠 있는 상태에서 빈 화면 → Title → 입력 영역 순서로 나타난다 (FundingInfoStep 모션 기준)
const EASE_STANDARD = [0.2, 0, 0, 1] as const;
const TITLE_TRANSITION = { delay: 0.15, duration: 0.45, ease: EASE_STANDARD };
const CONTENT_TRANSITION = { delay: 0.4, duration: 0.4, ease: EASE_STANDARD };

// 하단 고정 CTA(버튼 56 + 아래 패딩 20 + 그라데이션 일부)에 팔레트가 가려지지 않게 비운다
const CTA_CLEARANCE_CLASS = "pb-[calc(6rem+env(safe-area-inset-bottom))]";
const TEXT_ENTRY_SELECTOR = "input, [contenteditable]";

export type LetterVoice = {
  blob: Blob;
  transcript: string;
};

export type LetterWriteValues = {
  text: string;
  // 비로그인일 때만 입력받는다
  name: string;
  color: Color;
  // 녹음을 완료했을 때만 있다
  voice?: LetterVoice;
  // 스티커를 붙였을 때만 있다
  largeSticker?: Sticker;
  smallSticker?: Sticker;
  // 사진을 추가했을 때만 있다
  photo?: File;
};

type LetterWriteSheetProps = {
  open: boolean;
  // 이전 버튼에서 호출된다 (편지를 비우고 닫는다)
  onClose: () => void;
  // 우측 상단 X·ESC에서 호출된다. 편지는 비우지 않고 부모가 나가기 확인을 받게 한다
  onExit?: () => void;
  recipientName: string;
  isLoggedIn: boolean;
  onNext?: (values: LetterWriteValues) => void;
};

export default function LetterWriteSheet({
  open,
  onClose,
  onExit,
  recipientName,
  isLoggedIn,
  onNext,
}: LetterWriteSheetProps) {
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [shrunk, setShrunk] = useState(false);
  const [color, setColor] = useState<Color>("orange");
  const [toolOpen, setToolOpen] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false);
  const [voice, setVoice] = useState<LetterVoice | null>(null);
  const [stickerOpen, setStickerOpen] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [largeSticker, setLargeSticker] = useState<Sticker | null>(null);
  const [smallSticker, setSmallSticker] = useState<Sticker | null>(null);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [photo, setPhoto] = useState<{ file: File; url: string } | null>(null);
  const recorder = useVoiceRecorder();
  const toolAreaRef = useRef<HTMLDivElement>(null);
  // 툴 영역을 한 번 연 뒤에는 안내 말풍선을 다시 보여주지 않는다
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  // iOS는 키보드 열림·닫힘 이벤트가 없어 필드의 focus·blur를 키보드가 올라온 시점으로 본다
  const [isTyping, setIsTyping] = useState(false);
  // 비로그인 이름 입력란은 이름을 적고 포커스를 벗어나면 접히고, From 영역을 누르면 다시 열린다
  const [nameOpen, setNameOpen] = useState(true);
  const [nameReopened, setNameReopened] = useState(false);

  useEffect(() => {
    if (!photo) return;
    return () => URL.revokeObjectURL(photo.url);
  }, [photo]);

  // 짧은 화면에서 툴 영역이 하단 CTA에 가려지면 스크롤을 내리고, 이미 보이면 그대로 둔다(nearest)
  useEffect(() => {
    if (toolOpen) toolAreaRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [toolOpen, recordOpen, stickerOpen]);

  const canNext = text.trim() !== "" && (isLoggedIn || name.trim() !== "");

  // 편지지에 포커스가 가 입력을 시작하면 안내 말풍선은 더 보여주지 않는다
  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    const isTextEntry = event.target.matches(TEXT_ENTRY_SELECTOR);
    setIsTyping(isTextEntry);
    if (isTextEntry) setTooltipDismissed(true);
  };

  // 열려 있으면 접고(이름이 있을 때만), 접혀 있으면 다시 연다
  const handleSenderClick = () => {
    if (!nameOpen) {
      setNameOpen(true);
      setNameReopened(true);
    } else if (name.trim() !== "") {
      setNameOpen(false);
    }
  };

  // 시트를 닫으면 다음에 열 때 빈 편지로 시작한다
  const handleClose = () => {
    setText("");
    setShrunk(false);
    setName("");
    setColor("orange");
    setToolOpen(false);
    closeRecord();
    setVoice(null);
    closeSticker();
    setLargeSticker(null);
    setSmallSticker(null);
    setPhotoOpen(false);
    setPhoto(null);
    setTooltipDismissed(false);
    setIsTyping(false);
    setNameOpen(true);
    setNameReopened(false);
    onClose();
  };

  const handleAddClick = () => {
    setPhotoOpen(false);
    setToolOpen(true);
    setTooltipDismissed(true);
  };

  // 이전 녹음·자막·타이머가 남아 있어도 항상 처음 상태에서 시작한다
  const openRecord = () => {
    recorder.reset();
    setRecordOpen(true);
  };

  // 녹음 중이던 내용은 버리고 닫는다
  const closeRecord = () => {
    recorder.reset();
    setRecordOpen(false);
  };

  // 시트를 닫으면 고르던 스티커 선택은 풀고, 이미 붙인 스티커는 유지한다
  const closeSticker = () => {
    setStickerOpen(false);
    setSelectedSticker(null);
  };

  // 툴 영역을 접고 사진 슬롯만 강조한다. 이미 사진이 있으면 지우고 빈 슬롯에서 다시 시작한다. 다시 툴을 열면(+ 버튼) 강조가 풀린다
  const openPhoto = () => {
    setPhoto(null);
    setToolOpen(false);
    setPhotoOpen(true);
  };

  const handleRecordDone = () => {
    if (recorder.blob) setVoice({ blob: recorder.blob, transcript: recorder.transcript });
    closeRecord();
    setToolOpen(false);
  };

  return (
    <OpenSheet open={open} title="" onClose={onExit ?? handleClose} hideScrollbar>
      <div
        onFocus={handleFocus}
        onBlur={() => setIsTyping(false)}
        className={cn("flex w-full flex-col", CTA_CLEARANCE_CLASS)}>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={TITLE_TRANSITION}
          className="w-full">
          <Title title={`${recipientName}에게 직접\n편지를 남겨볼까요?`} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={CONTENT_TRANSITION}
          className="flex w-full flex-col items-center gap-1">
          <ScaledLetterPaper
            style="vividSolid"
            color={color}
            text={text}
            senderName={name}
            forceSmallText={shrunk}
            hasVoiceMessage={voice !== null}
            voiceAudio={voice?.blob}
            textTopInset={!isLoggedIn && nameOpen}
            onSenderClick={isLoggedIn ? undefined : handleSenderClick}
            largeIcon={largeSticker && <largeSticker.Icon aria-hidden className="size-full" />}
            smallIcon={smallSticker && <smallSticker.Icon aria-hidden className="size-full" />}
            // 스티커 시트가 열려 있을 때만 슬롯이 눌리게 한다(닫혀 있으면 슬롯 버튼이 disabled)
            onLargeIconClick={
              stickerOpen ? () => selectedSticker && setLargeSticker(selectedSticker) : undefined
            }
            onSmallIconClick={
              stickerOpen ? () => selectedSticker && setSmallSticker(selectedSticker) : undefined
            }
            onLargeIconRemove={() => setLargeSticker(null)}
            onSmallIconRemove={() => setSmallSticker(null)}
            iconSlotsActive={stickerOpen}
            hidePhotoSlot={stickerOpen}
            photoSrc={photo?.url}
            // 사진 툴을 골랐을 때만 슬롯이 눌린다
            photoSlotDisabled={!photoOpen}
            photoSlotActive={photoOpen}
            hideEmptyIconSlots={photoOpen && !photo}
            onPhotoChange={file => setPhoto({ file, url: URL.createObjectURL(file) })}
            onPhotoRemove={() => setPhoto(null)}
            textSlot={
              <LetterWriteBody
                text={text}
                onTextChange={value => {
                  setText(value);
                  if (value === "") setShrunk(false);
                }}
                shrunk={shrunk}
                onShrink={() => setShrunk(true)}
                placeholder={`${withVocativeParticle(recipientName)} 생일 축하해!`}
                name={name}
                onNameChange={isLoggedIn || !nameOpen ? undefined : setName}
                onNameBlur={() => name.trim() !== "" && setNameOpen(false)}
                nameAutoFocus={nameReopened}
              />
            }
          />
          <PaletteArea
            color={color}
            onColorChange={setColor}
            onAddClick={handleAddClick}
            tooltip={!tooltipDismissed}
            className="-mx-5 w-[calc(100%+2.5rem)]"
          />
          {toolOpen && (
            <div ref={toolAreaRef} className="w-full scroll-mb-24">
              {recordOpen ? (
                <LetterRecordSheet
                  status={recorder.status}
                  error={recorder.error}
                  color={color}
                  transcript={recorder.transcript}
                  interim={recorder.interim}
                  isSpeaking={recorder.isSpeaking}
                  onStart={recorder.start}
                  onStop={recorder.stop}
                  onDone={handleRecordDone}
                  onClose={closeRecord}
                />
              ) : stickerOpen ? (
                <StickerSheet
                  stickers={STICKERS}
                  selectedId={selectedSticker?.id ?? null}
                  onSelect={setSelectedSticker}
                  onClose={closeSticker}
                />
              ) : (
                <LetterToolSheet
                  onClose={() => setToolOpen(false)}
                  onSelectRecord={openRecord}
                  onSelectSticker={() => setStickerOpen(true)}
                  onSelectPhoto={openPhoto}
                />
              )}
            </div>
          )}
        </motion.div>
        <BottomCTA className={cn(isTyping && "pointer-coarse:hidden")}>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={CONTENT_TRANSITION}
            className="flex gap-2 *:min-w-24 *:flex-1">
            <Button color="neutral" variant="weak" size="xlarge" onClick={handleClose}>
              이전
            </Button>
            <Button
              color="neutral"
              size="xlarge"
              disabled={!canNext || recorder.status === "recording"}
              onClick={() =>
                onNext?.({
                  text,
                  name,
                  color,
                  ...(voice && { voice }),
                  ...(largeSticker && { largeSticker }),
                  ...(smallSticker && { smallSticker }),
                  ...(photo && { photo: photo.file }),
                })
              }>
              다음
            </Button>
          </motion.div>
        </BottomCTA>
      </div>
    </OpenSheet>
  );
}
