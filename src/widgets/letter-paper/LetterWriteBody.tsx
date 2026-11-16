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
};

// 소수점 줄 높이(22.95px×11줄)가 반올림되며 생기는 오차는 넘친 것으로 보지 않는다
const OVERFLOW_TOLERANCE_PX = 1;

const NAME_MAX_LENGTH = 8;

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
}: LetterWriteBodyProps) {
  // 편집 영역의 글자는 DOM이 관리한다. React가 다시 그리면 한글 조합 중 커서가 튀므로 처음 값만 넣는다
  const [initialText] = useState(text);
  const editorRef = useRef<HTMLDivElement>(null);
  const lastFitTextRef = useRef(initialText);
  const isGuest = onNameChange !== undefined;

  // 글자 수에 따라 글씨 크기가 바뀐 뒤의 높이로 재야 해서 그리기 전에 검사한다
  useLayoutEffect(() => {
    const editor = editorRef.current;
    const area = editor?.parentElement;
    if (!editor || !area) return;
    const available = area.clientHeight - (parseFloat(getComputedStyle(area).paddingTop) || 0);
    // 이름 입력란이 다시 열려 이미 넘친 글도 지우는 동작은 막지 않도록 글이 늘어난 경우만 되돌린다
    const grew = (editor.textContent ?? "").length > lastFitTextRef.current.length;
    if (grew && editor.offsetHeight - available > OVERFLOW_TOLERANCE_PX) {
      editor.textContent = lastFitTextRef.current;
      moveCaretToEnd(editor);
      onTextChange(lastFitTextRef.current);
      return;
    }
    lastFitTextRef.current = editor.textContent ?? "";
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {onNameChange && (
        <input
          type="text"
          aria-label="친구에게 보여질 이름"
          placeholder="친구에게 보여질 이름은 무엇인가요?"
          value={name ?? ""}
          onChange={event => onNameChange(event.target.value)}
          onBlur={onNameBlur}
          autoFocus={nameAutoFocus}
          maxLength={NAME_MAX_LENGTH}
          className="bg-semantic-fill-neutral/10 text-semantic-text-primary placeholder:text-semantic-text-tertiary absolute top-2 left-1 [field-sizing:content] max-w-[272px] min-w-0 rounded-xl p-2.5 [letter-spacing:var(--letter-spacing-default)] outline-none [font:var(--semantic-label-x-small)] focus-visible:ring-2 focus-visible:ring-black/20"
        />
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
        aria-label="편지 내용"
        tabIndex={0}
        contentEditable="plaintext-only"
        suppressContentEditableWarning
        onInput={event => onTextChange(event.currentTarget.textContent ?? "")}
        className="text-semantic-text-strong relative outline-none">
        {initialText}
      </div>
    </>
  );
}
