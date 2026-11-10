import { cn } from "@/utils/cn";

type ListTextType = "default" | "price";
type ListTextAlign = "left" | "right";

type ListTextProps = {
  title: string;
  description?: string;
  titleUp?: boolean;
  type?: ListTextType;
  align?: ListTextAlign;
  className?: string;
};

const TITLE_FONT: Record<ListTextType, string> = {
  default: "[font:var(--semantic-label-medium)]",
  price: "[font:var(--semantic-label-large)]",
};

export default function ListText({
  title,
  description,
  titleUp = false,
  type = "default",
  align = "left",
  className,
}: ListTextProps) {
  const titleNode = <p className={cn("text-semantic-text-primary", TITLE_FONT[type])}>{title}</p>;
  const descriptionNode = description && (
    <p className="text-semantic-text-secondary whitespace-pre-line [font:var(--semantic-subtext-large)]">
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
        !titleUp && "[&>p:first-child]:whitespace-nowrap",
        align === "right" && "text-right",
        className,
      )}>
      {firstLine}
      {secondLine}
    </div>
  );
}
