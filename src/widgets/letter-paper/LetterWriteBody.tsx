"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/utils/cn";

type LetterWriteBodyProps = {
  text: string;
  onTextChange: (text: string) => void;
  placeholder: string;
  // 있으면 친구에게 보여질 이름 입력란을 편지 위에 둔다(비로그인). LetterPaper의 textTopInset과 함께 쓴다
  name?: string;
  onNameChange?: (name: string) => void;
  onNameBlur?: () => void;
  // 이름 입력란을 다시 열 때 바로 입력할 수 있게 포커스를 준다
  nameAutoFocus?: boolean;
  // 이미 작은 글씨로 줄었는지, 큰 글씨 영역을 넘쳤을 때 줄이도록 요청하는 콜백
  shrunk?: boolean;
  onShrink?: () => void;
};

// 소수점 줄 높이(22.95px×11줄)가 반올림되며 생기는 오차는 넘친 것으로 보지 않는다
const OVERFLOW_TOLERANCE_PX = 1;

const NAME_MAX_LENGTH = 8;
const NAME_PLACEHOLDER = "친구에게 보여질 이름은 무엇인가요?";
const NAME_FIELD_TEXT_CLASS =
  "rounded-xl p-2.5 [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-x-small)]";

function moveCaretToEnd(element: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

// LetterPaper의 textSlot으로 넣는다. 슬롯 회피·글씨 크기·줄 수는 LetterPaper 본문 영역이 정하고, 여기서는 그 영역을 넘는 입력만 막는다
export default function LetterWriteBody({
  text,
  onTextChange,
  placeholder,
  name,
  onNameChange,
  onNameBlur,
  nameAutoFocus,
  shrunk = false,
  onShrink,
}: LetterWriteBodyProps) {
  // 편집 영역의 글자는 DOM이 관리한다. React가 다시 그리면 한글 조합 중 커서가 튀므로 처음 값만 넣는다
  const [initialText] = useState(text);
  const editorRef = useRef<HTMLDivElement>(null);
  const lastFitTextRef = useRef(initialText);
  const isGuest = onNameChange !== undefined;

  const composingRef = useRef(false);

  // 글자 수에 따라 글씨 크기가 바뀐 뒤의 높이로 재야 해서 그리기 전에 검사한다
  const fitToArea = () => {
    const editor = editorRef.current;
    const area = editor?.parentElement;
    if (!editor || !area) return;
    const composing = composingRef.current;
    const available = area.clientHeight - (parseFloat(getComputedStyle(area).paddingTop) || 0);
    // 이름 입력란이 다시 열려 이미 넘친 글도 지우는 동작은 막지 않도록 글이 줄어든 경우는 되돌리지 않는다. 길이가 같은 선택 영역 교체는 검사한다
    const current = editor.textContent ?? "";
    const grew =
      current !== lastFitTextRef.current && current.length >= lastFitTextRef.current.length;
    if (grew && editor.offsetHeight - available > OVERFLOW_TOLERANCE_PX) {
      // 큰 글씨 영역을 넘으면 막기 전에 작은 글씨로 줄여 다시 잰다(shrunk가 바뀌면 아래 effect가 재검사)
      if (!shrunk && onShrink) {
        onShrink();
        return;
      }
      // 조합 중인 글자(마지막 자모)가 새 줄을 만들면, 조합을 먼저 blur로 확정한 뒤에야 글을 덮어써도 입력이 끊기지 않는다
      if (composing) {
        composingRef.current = false;
        editor.blur();
      }
      editor.textContent = lastFitTextRef.current;
      if (composing) editor.focus();
      moveCaretToEnd(editor);
      onTextChange(lastFitTextRef.current);
      return;
    }
    // 조합 중에는 확정된 글만 기준으로 삼아야 조합 글자가 넘쳤을 때 그 앞 상태로 되돌릴 수 있다
    if (composing) return;
    lastFitTextRef.current = editor.textContent ?? "";
  };

  useLayoutEffect(fitToArea, [text, shrunk]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {onNameChange && (
        // field-sizing을 지원하지 않는 브라우저에서도 글자 길이에 맞게 늘어나도록, 같은 글자를 담은 숨은 span과 input을 한 칸에 겹친다
        <div className="absolute top-2 left-0 inline-grid max-w-[272px]">
          <span
            aria-hidden
            className={cn(
              NAME_FIELD_TEXT_CLASS,
              "invisible col-start-1 row-start-1 whitespace-pre",
            )}>
            {name || NAME_PLACEHOLDER}
          </span>
          <input
            type="text"
            aria-label="친구에게 보여질 이름"
            required
            placeholder={NAME_PLACEHOLDER}
            value={name ?? ""}
            // IME 조합 중인 글자는 maxLength를 무시하고 잠깐 들어와 폭이 늘었다 줄며 깜빡이므로, 값을 바로 잘라 되돌린다
            // 초과분은 뒤쪽을 버린다(앞 NAME_MAX_LENGTH자만 유지) — 이미 가득 찬 이름의 앞에 조합하면 기존 마지막 글자가 밀려난다
            onChange={event => onNameChange(event.target.value.slice(0, NAME_MAX_LENGTH))}
            onBlur={onNameBlur}
            autoFocus={nameAutoFocus}
            maxLength={NAME_MAX_LENGTH}
            className={cn(
              NAME_FIELD_TEXT_CLASS,
              "bg-semantic-fill-neutral/10 text-semantic-text-primary placeholder:text-semantic-text-tertiary col-start-1 row-start-1 w-0 min-w-full outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-inset",
            )}
          />
        </div>
      )}
      {text === "" && (
        <div
          aria-hidden
          className={cn(
            "text-semantic-text-quaternary pointer-events-none absolute inset-0 flex flex-col gap-1 [letter-spacing:var(--letter-spacing-default)]",
            isGuest && "pt-12",
          )}>
          <p className="[font:var(--semantic-label-medium-weak)]">필수 작성)</p>
          <p className="[font:var(--semantic-title-large)]">{placeholder}</p>
        </div>
      )}
      <div
        ref={editorRef}
        role="textbox"
        aria-multiline="true"
        aria-required="true"
        aria-label="편지 내용"
        tabIndex={0}
        contentEditable="plaintext-only"
        suppressContentEditableWarning
        onInput={event => onTextChange(event.currentTarget.textContent ?? "")}
        onCompositionStart={() => (composingRef.current = true)}
        onCompositionEnd={() => {
          composingRef.current = false;
          fitToArea();
        }}
        className="text-semantic-text-strong relative outline-none">
        {initialText}
      </div>
    </>
  );
}
