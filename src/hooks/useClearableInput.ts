import { type ChangeEvent, type Ref, useImperativeHandle, useRef, useState } from "react";

type ClearableElement = HTMLInputElement | HTMLTextAreaElement;

type UseClearableInputOptions<T extends ClearableElement> = {
  value?: string;
  defaultValue: string;
  ref?: Ref<T>;
  maxLength?: number;
  onChange?: (event: ChangeEvent<T>) => void;
  onClear?: () => void;
};

const graphemeSegmenter = new Intl.Segmenter();

// 길이는 UTF-16 기준(백엔드 Java 길이 검증과 일치)으로 세되, 이모지가 반쪽만 남지 않게 보이는 글자 경계로 내린다
const snapToGraphemeStart = (text: string, index: number) => {
  let boundary = 0;
  for (const { index: start } of graphemeSegmenter.segment(text)) {
    if (start > index) break;
    boundary = start;
  }
  return boundary;
};

export default function useClearableInput<T extends ClearableElement>({
  value,
  defaultValue,
  ref,
  maxLength,
  onChange,
  onClear,
}: UseClearableInputOptions<T>) {
  const elementRef = useRef<T>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [hasOverflowed, setHasOverflowed] = useState(false);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;
  // 제어 모드에서 부모가 값을 줄이면 change 이벤트가 없으므로 현재 길이로 한 번 더 걸러낸다
  const isOverLimit = hasOverflowed && maxLength !== undefined && currentValue.length >= maxLength;

  useImperativeHandle(ref, () => elementRef.current as T, []);

  const handleChange = (event: ChangeEvent<T>) => {
    // 네이티브 maxlength는 한글 조합 중엔 초과 입력을 허용했다가 blur 시점에 잘라내므로 직접 자른다
    if (maxLength !== undefined) {
      const element = event.target;
      const overflow = element.value.length - maxLength;
      if (overflow > 0) {
        // 끝에서 자르면 중간 삽입 시 뒤쪽 기존 글자가 지워지므로, 커서 바로 앞의 새 입력분만 버린다
        const cursor = element.selectionStart ?? element.value.length;
        const keepUntil = snapToGraphemeStart(element.value, Math.max(0, cursor - overflow));
        element.value = element.value.slice(0, keepUntil) + element.value.slice(cursor);
        if (element.selectionStart !== null) element.setSelectionRange(keepUntil, keepUntil);
        setHasOverflowed(true);
      } else if (overflow < 0) {
        setHasOverflowed(false);
      }
    }
    if (!isControlled) setUncontrolledValue(event.target.value);
    onChange?.(event);
  };

  const handleClear = () => {
    if (!isControlled) setUncontrolledValue("");
    setHasOverflowed(false);
    onClear?.();
    elementRef.current?.focus();
  };

  return { elementRef, currentValue, isOverLimit, handleChange, handleClear };
}
