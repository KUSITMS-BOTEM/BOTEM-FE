import { useEffect, useRef, useState, type ChangeEvent } from "react";

type UseImageFileSelectOptions = {
  allowedTypes?: string[];
  maxSizeBytes?: number;
  onSelect: (file: File) => void;
};

const TOAST_DURATION_MS = 2500;
const DECODE_ERROR_MESSAGE = "이미지를 불러올 수 없어요. 다른 파일을 선택해주세요";

// 파일 input의 change 핸들러 + 타입·용량·디코딩 검증. 통과한 파일만 onSelect로 넘기고 실패 사유는 errorText로 준다
export function useImageFileSelect({
  allowedTypes,
  maxSizeBytes,
  onSelect,
}: UseImageFileSelectOptions) {
  const latestRequestIdRef = useRef(0);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (!errorText) return;
    const timer = setTimeout(() => setErrorText(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [errorText]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    // 파일 선택 사이 디코딩이 끝나는 순서가 뒤바뀌어도 가장 마지막 선택만 반영되도록 요청 id로 추적한다. 검증에서 거부된 선택도 이전 디코딩 결과를 무효화해야 하므로 검증보다 먼저 올린다
    const requestId = ++latestRequestIdRef.current;

    if (allowedTypes && !allowedTypes.includes(file.type)) {
      setErrorText(
        `${allowedTypes.map(type => type.split("/")[1].replace("jpeg", "jpg")).join(", ")} 파일만 올릴 수 있어요`,
      );
      return;
    }
    if (maxSizeBytes && file.size > maxSizeBytes) {
      setErrorText(`${Math.floor(maxSizeBytes / (1024 * 1024))}MB 이하의 파일만 올릴 수 있어요`);
      return;
    }

    // 확장자만 이미지인 손상된 파일·텍스트 파일도 accept 필터를 통과할 수 있어 디코딩으로 직접 검증한다
    try {
      const bitmap = await createImageBitmap(file);
      bitmap.close();
      if (requestId !== latestRequestIdRef.current) return;
      setErrorText(null);
      onSelect(file);
    } catch {
      if (requestId !== latestRequestIdRef.current) return;
      setErrorText(DECODE_ERROR_MESSAGE);
    }
  };

  return { errorText, handleFileChange };
}
