import Button from "@/components/Button";
import LoadingAnimation from "@/components/LoadingAnimation";

type FundingLoadStateProps = {
  isLoading: boolean;
  loadingLabel: string;
  errorMessage: string;
  onRetry: () => void;
};

export default function FundingLoadState({
  isLoading,
  loadingLabel,
  errorMessage,
  onRetry,
}: FundingLoadStateProps) {
  if (isLoading) {
    return (
      <div role="status" className="flex flex-1 items-center justify-center">
        <LoadingAnimation size="large" />
        <span className="sr-only">{loadingLabel}</span>
      </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <p className="text-semantic-text-secondary [font:var(--semantic-subtext-large)]">
        {errorMessage}
      </p>
      <Button onClick={onRetry}>다시 시도</Button>
    </main>
  );
}
