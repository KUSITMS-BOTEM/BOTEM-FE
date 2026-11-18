import { cn } from "@/utils/cn";

type ListTextType = "default" | "price";
type ListTextAlign = "left" | "right";
type ListTextSize = "medium" | "small";

type ListTextProps = {
  title: string;
  description?: string;
  caption?: string;
  titleUp?: boolean;
  type?: ListTextType;
  align?: ListTextAlign;
  size?: ListTextSize;
  className?: string;
};

const TITLE_FONT: Record<ListTextType, string> = {
  default: "[font:var(--semantic-label-medium)]",
  price: "[font:var(--semantic-label-large)]",
};

const DESCRIPTION_FONT: Record<ListTextSize, string> = {
  medium: "[font:var(--semantic-subtext-large)]",
  small: "[font:var(--semantic-subtext-medium)]",
};

export default function ListText({
  title,
  description,
  caption,
  titleUp = false,
  type = "default",
  align = "left",
  size = "medium",
  className,
}: ListTextProps) {
  const isSmall = size === "small";
  const titleNode = (
    <p
      className={cn(
        "text-semantic-text-primary",
        isSmall ? "whitespace-pre-line [font:var(--semantic-label-small)]" : TITLE_FONT[type],
      )}>
      {title}
    </p>
  );
  const descriptionNode = description && (
    <p className={cn("text-semantic-text-secondary whitespace-pre-line", DESCRIPTION_FONT[size])}>
      {description}
    </p>
  );
  const [firstLine, secondLine] = titleUp
    ? [descriptionNode, titleNode]
    : [titleNode, descriptionNode];

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-0.5 [letter-spacing:var(--letter-spacing-default)]",
        "[&>p]:overflow-hidden [&>p]:text-ellipsis",
        !titleUp && !isSmall && "[&>p:first-child]:whitespace-nowrap",
        align === "right" && "text-right",
        className,
      )}>
      {firstLine}
      {secondLine}
      {caption && (
        <p className="text-semantic-text-tertiary [font:var(--semantic-subtext-small)]">
          {caption}
        </p>
      )}
    </div>
  );
}
