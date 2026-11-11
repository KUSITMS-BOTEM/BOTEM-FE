import Button from "@/components/Button";

type HomeLoadErrorProps = {
  message: string;
  onRetry: () => void;
};

export default function HomeLoadError({ message, onRetry }: HomeLoadErrorProps) {
  return (
    <div className="flex w-full flex-col items-center gap-4 py-10 text-center">
      <p className="text-semantic-text-secondary [font:var(--semantic-subtext-large)]">{message}</p>
      <Button onClick={onRetry}>다시 시도</Button>
    </div>
  );
}
