"use client";

import { type FocusEvent, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import BottomCTA from "@/components/BottomCTA";
import Button from "@/components/Button";
import Dialog from "@/components/Dialog";
import IconButton from "@/components/IconButton";
import OpenSheet from "@/components/OpenSheet";
import Title from "@/components/Title";
import ToastMessage from "@/components/ToastMessage";
import type { Color } from "@/constants/color";
import type { LetterPaperStyle } from "@/constants/letterPaperStyle";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { cn } from "@/utils/cn";
import { withVocativeParticle } from "@/utils/withSubjectParticle";
import ScaledLetterPaper from "@/widgets/letter-paper/ScaledLetterPaper";
import LetterRecordSheet from "@/widgets/letter-paper/LetterRecordSheet";
import LetterPaperSheet from "@/widgets/letter-paper/LetterPaperSheet";
import LetterToolSheet from "@/widgets/letter-paper/LetterToolSheet";
import LetterWriteBody from "@/widgets/letter-paper/LetterWriteBody";
import PaletteArea from "@/widgets/letter-paper/PaletteArea";
import StickerSheet from "@/widgets/letter-paper/StickerSheet";
import { STICKERS, type Sticker } from "@/widgets/letter-paper/stickers";
import IconReset from "@/assets/icons/icon-reset.svg?react";

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

type ActiveTool = null | "menu" | "record" | "sticker" | "paper" | "photo";

export type LetterWriteValues = {
  text: string;
  // 비로그인일 때만 입력받는다
  name: string;
  color: Color;
  paperStyle: LetterPaperStyle;
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
  // 있으면 수정 모드다: 이 값으로 시작하고, 이름은 바꿀 수 없으며, 되돌리기·저장 버튼이 나온다.
  // 값은 처음 마운트될 때만 읽으므로 서버 데이터가 도착한 뒤에 마운트하거나 key로 다시 마운트한다
  initialValues?: LetterWriteValues;
  onSave?: (values: LetterWriteValues) => void;
};

const TOAST_DURATION_MS = 2000;

const toPhotoState = (file?: File) => (file ? { file, url: URL.createObjectURL(file) } : null);

export default function LetterWriteSheet({
  open,
  onClose,
  onExit,
  recipientName,
  isLoggedIn,
  onNext,
  initialValues,
  onSave,
}: LetterWriteSheetProps) {
  const isEdit = initialValues !== undefined;
  // 수정 모드에서는 보탠 사람의 이름을 바꿀 수 없어 로그인 상태처럼 이름 입력란을 두지 않는다
  const hideName = isLoggedIn || isEdit;
  const [text, setText] = useState(initialValues?.text ?? "");
  const [name, setName] = useState(initialValues?.name ?? "");
  const [shrunk, setShrunk] = useState(false);
  const [color, setColor] = useState<Color>(initialValues?.color ?? "orange");
  // 툴은 한 번에 하나만 열린다. photo는 툴 영역을 접고 사진 슬롯만 강조하는 상태다
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [voice, setVoice] = useState<LetterVoice | null>(initialValues?.voice ?? null);
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [largeSticker, setLargeSticker] = useState<Sticker | null>(
    initialValues?.largeSticker ?? null,
  );
  const [smallSticker, setSmallSticker] = useState<Sticker | null>(
    initialValues?.smallSticker ?? null,
  );
  const [photo, setPhoto] = useState<{ file: File; url: string } | null>(() =>
    toPhotoState(initialValues?.photo),
  );
  const [paperStyle, setPaperStyle] = useState<LetterPaperStyle>(
    initialValues?.paperStyle ?? "vividSolid",
  );
  // 편지 본문 편집 영역은 처음 값만 읽으므로, 값을 되돌릴 때 key를 올려 다시 마운트한다
  const [bodyKey, setBodyKey] = useState(0);
  const [toastShown, setToastShown] = useState(false);
  // 수정 모드에서 변경사항을 버리게 되는 동작(나가기·되돌리기)은 확인을 받고 진행한다
  const [confirm, setConfirm] = useState<null | "exit" | "reset">(null);
  const recorder = useVoiceRecorder();
  const toolAreaRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  // 툴 영역을 한 번 연 뒤에는 안내 말풍선을 다시 보여주지 않는다
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  // iOS는 키보드 열림·닫힘 이벤트가 없어 필드의 focus·blur를 키보드가 올라온 시점으로 본다
  const [isTyping, setIsTyping] = useState(false);
  // 비로그인 이름 입력란은 이름을 적고 포커스를 벗어나면 접히고, From 영역을 누르면 다시 열린다
  const [nameOpen, setNameOpen] = useState(true);
  const [nameReopened, setNameReopened] = useState(false);

  // 사진 검증 콜백은 선택 시점의 클로저를 쥐고 있어 open prop 대신 ref로 최신 값을 읽는다
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // 되돌리기(bodyKey 증가) 전에 시작한 사진 검증 결과를 버리기 위해, 선택 시점의 bodyKey와 최신 값을 비교한다
  const bodyKeyRef = useRef(bodyKey);
  useEffect(() => {
    bodyKeyRef.current = bodyKey;
  }, [bodyKey]);

  const toolOpen = activeTool !== null && activeTool !== "photo";
  const stickerOpen = activeTool === "sticker";
  const photoOpen = activeTool === "photo";

  useEffect(() => {
    if (!photo) return;
    return () => URL.revokeObjectURL(photo.url);
  }, [photo]);

  // 짧은 화면에서 툴 영역이 하단 CTA에 가려지면 스크롤을 내리고, 이미 보이면 그대로 둔다(nearest)
  useEffect(() => {
    if (toolOpen) toolAreaRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeTool, toolOpen]);

  useEffect(() => {
    if (!toastShown) return;
    const timer = setTimeout(() => setToastShown(false), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toastShown]);

  const canNext = text.trim() !== "" && (hideName || name.trim() !== "");

  // 사진·스티커·녹음은 원본과 같은 참조/id인지로 비교한다. 이름은 수정할 수 없어 비교하지 않는다
  const isDirty =
    initialValues !== undefined &&
    (text !== initialValues.text ||
      color !== initialValues.color ||
      paperStyle !== initialValues.paperStyle ||
      voice?.blob !== initialValues.voice?.blob ||
      largeSticker?.id !== initialValues.largeSticker?.id ||
      smallSticker?.id !== initialValues.smallSticker?.id ||
      photo?.file !== initialValues.photo);
  const canSave = isDirty && text.trim() !== "" && recorder.status !== "recording";

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

  // 편지를 values(없으면 빈 편지)로 되돌린다
  const restore = (values?: LetterWriteValues) => {
    setText(values?.text ?? "");
    setShrunk(false);
    setName(values?.name ?? "");
    setColor(values?.color ?? "orange");
    setPaperStyle(values?.paperStyle ?? "vividSolid");
    recorder.reset();
    setVoice(values?.voice ?? null);
    setSelectedSticker(null);
    setLargeSticker(values?.largeSticker ?? null);
    setSmallSticker(values?.smallSticker ?? null);
    setActiveTool(null);
    setPhoto(toPhotoState(values?.photo));
    setBodyKey(key => key + 1);
  };

  // 시트를 닫으면 다음에 열 때 처음 상태(수정 모드는 원본, 아니면 빈 편지)로 시작한다
  const handleClose = () => {
    restore(initialValues);
    setTooltipDismissed(false);
    setIsTyping(false);
    setNameOpen(true);
    setNameReopened(false);
    onClose();
  };

  // 바뀐 게 있으면 확인을 받고, 없으면 되돌릴 것이 없다고 알린다
  const handleReset = () => {
    if (isDirty) setConfirm("reset");
    else setToastShown(true);
  };

  // 바뀐 게 있으면 저장되지 않는다고 확인을 받고 나간다
  const handleBack = () => {
    if (isDirty) setConfirm("exit");
    else handleClose();
  };

  const handleConfirm = () => {
    if (confirm === "reset") restore(initialValues);
    else handleClose();
    setConfirm(null);
  };

  const buildValues = (): LetterWriteValues => ({
    text,
    name,
    color,
    paperStyle,
    ...(voice && { voice }),
    ...(largeSticker && { largeSticker }),
    ...(smallSticker && { smallSticker }),
    ...(photo && { photo: photo.file }),
  });

  // 이미 열린 툴은 유지하고, 닫혀 있거나 사진 강조 상태면 툴 목록을 연다
  const handleAddClick = () => {
    setActiveTool(tool => (tool && tool !== "photo" ? tool : "menu"));
    setTooltipDismissed(true);
  };

  // 이전 녹음·자막·타이머가 남아 있어도 항상 처음 상태에서 시작한다
  const openRecord = () => {
    recorder.reset();
    setActiveTool("record");
  };

  // 녹음 중이던 내용은 버리고 툴 목록으로 돌아간다
  const closeRecord = () => {
    recorder.reset();
    setActiveTool("menu");
  };

  // 시트를 닫으면 고르던 스티커 선택은 풀고, 이미 붙인 스티커는 유지한다
  const closeSticker = () => {
    setSelectedSticker(null);
    setActiveTool("menu");
  };

  // 툴 영역을 접고 사진 슬롯만 강조한다. 이미 사진이 있으면 지우고 빈 슬롯에서 다시 시작한다. 다시 툴을 열면(+ 버튼) 강조가 풀린다
  const openPhoto = () => {
    setPhoto(null);
    setActiveTool("photo");
  };

  const handleRecordDone = () => {
    if (recorder.blob) setVoice({ blob: recorder.blob, transcript: recorder.transcript });
    recorder.reset();
    setActiveTool(null);
  };

  return (
    <OpenSheet
      open={open}
      title={isEdit ? "보탬 수정하기" : ""}
      onClose={isEdit ? handleBack : (onExit ?? handleClose)}
      closeType={isEdit ? "back" : undefined}
      headerAction={
        isEdit ? (
          <IconButton
            size="xlarge"
            icon={<IconReset />}
            aria-label="되돌리기"
            onClick={handleReset}
          />
        ) : undefined
      }
      overlay={
        isEdit ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-40 flex justify-center">
            <ToastMessage show={toastShown} text="변경된 사항이 없어요" state={false} />
          </div>
        ) : undefined
      }
      hideScrollbar>
      <div
        ref={topRef}
        onFocus={handleFocus}
        onBlur={() => setIsTyping(false)}
        className={cn("flex w-full flex-col", CTA_CLEARANCE_CLASS)}>
        {!isEdit && (
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={TITLE_TRANSITION}
            className="w-full">
            <Title title={`${recipientName}에게 직접\n편지를 남겨볼까요?`} />
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={CONTENT_TRANSITION}
          className="flex w-full flex-col items-center gap-1">
          <ScaledLetterPaper
            style={paperStyle}
            color={color}
            text={text}
            senderName={name}
            forceSmallText={shrunk}
            hasVoiceMessage={voice !== null}
            voiceAudio={voice?.blob}
            textTopInset={!hideName && nameOpen}
            onSenderClick={hideName ? undefined : handleSenderClick}
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
            hidePhotoSlot={stickerOpen && !photo}
            photoSrc={photo?.url}
            // 사진 툴을 골랐을 때만 슬롯이 눌린다
            photoSlotDisabled={!photoOpen}
            photoSlotActive={photoOpen}
            hideEmptyIconSlots={photoOpen && !photo}
            // 검증 중 시트를 닫았다면 초기화된 편지에 사진이 되살아나지 않게 버린다
            onPhotoChange={file => {
              if (openRef.current && bodyKey === bodyKeyRef.current)
                setPhoto({ file, url: URL.createObjectURL(file) });
            }}
            onPhotoRemove={() => setPhoto(null)}
            textSlot={
              <LetterWriteBody
                key={bodyKey}
                text={text}
                onTextChange={value => {
                  setText(value);
                  if (value === "") setShrunk(false);
                }}
                shrunk={shrunk}
                onShrink={() => setShrunk(true)}
                placeholder={`${withVocativeParticle(recipientName)} 생일 축하해!`}
                name={name}
                onNameChange={hideName || !nameOpen ? undefined : setName}
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
              {activeTool === "record" ? (
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
              ) : activeTool === "paper" ? (
                <LetterPaperSheet
                  color={color}
                  selectedStyle={paperStyle}
                  onSelect={style => {
                    setPaperStyle(style);
                    // 시트가 편지지 아래에 있어 짧은 화면에서는 바뀐 편지지가 가려진다
                    topRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
                  }}
                  onClose={() => setActiveTool("menu")}
                />
              ) : (
                <LetterToolSheet
                  color={color}
                  onClose={() => setActiveTool(null)}
                  onSelectLetter={() => setActiveTool("paper")}
                  onSelectRecord={openRecord}
                  onSelectSticker={() => setActiveTool("sticker")}
                  onSelectPhoto={openPhoto}
                />
              )}
            </div>
          )}
        </motion.div>
        <BottomCTA
          className={cn(isTyping && "pointer-coarse:hidden")}
          upper={
            isEdit ? (
              <p className="text-semantic-text-tertiary text-center [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-x-small-weak)]">
                보탠 금액과 이름은 바꿀 수 없어요
              </p>
            ) : undefined
          }>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={CONTENT_TRANSITION}
            className="flex gap-2 *:min-w-24 *:flex-1">
            {isEdit ? (
              <Button
                color="brand"
                size="xlarge"
                disabled={!canSave}
                onClick={() => onSave?.(buildValues())}>
                이대로 저장하기
              </Button>
            ) : (
              <>
                <Button color="neutral" variant="weak" size="xlarge" onClick={handleClose}>
                  이전
                </Button>
                <Button
                  color="neutral"
                  size="xlarge"
                  disabled={!canNext || recorder.status === "recording"}
                  onClick={() => onNext?.(buildValues())}>
                  다음
                </Button>
              </>
            )}
          </motion.div>
        </BottomCTA>
        {isEdit && (
          <Dialog
            kind="confirm"
            open={confirm !== null}
            title={confirm === "reset" ? "원래대로 돌릴까요?" : "이대로 나갈까요?"}
            description={
              confirm === "reset"
                ? "지금 변경한 내용은 되돌릴 수 없어요"
                : "변경된 내용은 저장되지 않아요"
            }
            confirmColor="neutral"
            onCancel={() => setConfirm(null)}
            onConfirm={handleConfirm}
          />
        )}
      </div>
    </OpenSheet>
  );
}
