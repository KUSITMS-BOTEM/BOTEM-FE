import { cn } from "@/utils/cn";
import Button from "@/components/Button";

type TitleFontType = "pretendard" | "a2z";

type TitleBaseProps = {
  type?: TitleFontType;
  title: string;
  description?: string;
  titleSize?: number;
  descriptionSize?: number;
  className?: string;
};

type TitleProps = TitleBaseProps &
  (
    | { showButton: true; buttonLabel: string; onButtonClick: () => void }
    | { showButton?: false; buttonLabel?: never; onButtonClick?: never }
  );

export default function Title({
  type = "pretendard",
  title,
  description,
  titleSize = 24,
  descriptionSize = 15,
  showButton = false,
  buttonLabel,
  onButtonClick,
  className,
}: TitleProps) {
  return (
    <div className={cn("flex w-full flex-col items-start gap-4 pt-2 pb-5", className)}>
      <div className="flex w-full flex-col items-start gap-2">
        <p
          style={{ fontSize: titleSize }}
          className={cn(
            "text-semantic-text-strong w-full [line-height:var(--line-height-default)] [letter-spacing:var(--letter-spacing-default)] whitespace-pre-line",
            type === "pretendard"
              ? "[font-family:var(--font-family-pretendard)] font-bold"
              : "[font-family:var(--font-family-a2-z)] font-semibold",
          )}>
          {title}
        </p>
        {description && (
          <p
            style={{ fontSize: descriptionSize }}
            className="text-semantic-text-secondary w-full [font-family:var(--font-family-pretendard)] [line-height:var(--line-height-default)] font-normal [letter-spacing:var(--letter-spacing-default)]">
            {description}
          </p>
        )}
      </div>
      {showButton && (
        <Button color="neutral" variant="weak" size="small" onClick={onButtonClick}>
          {buttonLabel}
        </Button>
      )}
    </div>
  );
}
