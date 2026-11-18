import { useEffect, useRef, useState } from "react";

const TOAST_DURATION_MS = 2000;

type ShareToast = "success" | "fail" | null;

// 기기 공유창이 있으면 열고, 없거나 실패하면 링크를 복사한 뒤 토스트 결과를 알려준다
export function useShareLink() {
  const [toast, setToast] = useState<ShareToast>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const showToast = (result: "success" | "fail") => {
    setToast(result);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  };

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast("success");
    } catch {
      showToast("fail");
    }
  };

  const share = async ({ title, url }: { title: string; url: string }) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        // 사용자가 공유창을 닫은 경우다. 그 외 실패는 링크 복사로 넘어간다
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await copyLink(url);
  };

  return { toast, share, copyLink };
}
