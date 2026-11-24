"use client";

import type { KeyboardEvent } from "react";

import Profile from "@/components/Profile";
import type { Color } from "@/constants/color";
import { cn } from "@/utils/cn";

type SenderNameInputProps = {
  name: string;
  onNameChange: (name: string) => void;
  // 포커스를 벗어나거나 Enter를 눌렀을 때 호출된다
  onBlur: () => void;
  color: Color;
  // 확정된 이름을 다시 고칠 때 바로 입력할 수 있게 포커스를 준다
  autoFocus?: boolean;
};

const NAME_MAX_LENGTH = 8;
const NAME_PLACEHOLDER = "당신의 이름은 무엇인가요?";
const NAME_TEXT_CLASS =
  "[letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-subtext-medium-strong)]";

// LetterPaper의 senderSlot으로 넣는다. 이름을 적고 확정하면 슬롯 대신 'From. 이름'이 보인다
export default function SenderNameInput({
  name,
  onNameChange,
  onBlur,
  color,
  autoFocus,
}: SenderNameInputProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // 한글 조합 중 Enter는 마지막 글자를 확정하는 키라 이름 확정으로 쓰지 않는다
    if (event.key === "Enter" && !event.nativeEvent.isComposing) event.currentTarget.blur();
  };

  return (
    // 안쪽 여백(오른쪽 10px, 아래 6px)만큼 바깥으로 빼서, 입력 중에도 글자가 'From. 이름' 자리에 놓이게 한다
    <label className="bg-semantic-icon-on-fill -mr-2.5 -mb-1.5 ml-auto flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 has-[input:focus-visible]:ring-1 has-[input:focus-visible]:ring-black/20">
      <Profile color={color} showIconButton={false} className="size-5 shrink-0" />
      {/* field-sizing을 지원하지 않는 브라우저에서도 글자 길이에 맞게 늘어나도록, 같은 글자를 담은 숨은 span과 input을 한 칸에 겹친다 */}
      <span className="inline-grid">
        <span
          aria-hidden
          className={cn(NAME_TEXT_CLASS, "invisible col-start-1 row-start-1 whitespace-pre")}>
          {name || NAME_PLACEHOLDER}
        </span>
        <input
          type="text"
          aria-label="친구에게 보여질 이름"
          required
          placeholder={NAME_PLACEHOLDER}
          value={name}
          // IME 조합 중인 글자는 maxLength를 무시하고 잠깐 들어와 폭이 늘었다 줄며 깜빡이므로, 값을 바로 잘라 되돌린다
          // 초과분은 뒤쪽을 버린다(앞 NAME_MAX_LENGTH자만 유지) — 이미 가득 찬 이름의 앞에 조합하면 기존 마지막 글자가 밀려난다
          onChange={event => onNameChange(event.target.value.slice(0, NAME_MAX_LENGTH))}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          maxLength={NAME_MAX_LENGTH}
          className={cn(
            NAME_TEXT_CLASS,
            "text-semantic-text-strong placeholder:text-semantic-text-tertiary col-start-1 row-start-1 w-0 min-w-full bg-transparent outline-none",
          )}
        />
      </span>
    </label>
  );
}
