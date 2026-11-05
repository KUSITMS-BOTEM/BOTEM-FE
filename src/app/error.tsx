"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <p>오류가 발생했습니다.</p>
      <button type="button" onClick={reset}>
        다시 시도
      </button>
    </div>
  );
}
