import { type ButtonHTMLAttributes, type ReactNode } from "react";
import IconKakao from "@/assets/icons/icon-kakao.svg?react";
import { cn } from "@/utils/cn";

type KakaoLoginButtonOwnProps = {
  children: ReactNode;
};

type KakaoLoginButtonProps = KakaoLoginButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof KakaoLoginButtonOwnProps>;

export default function KakaoLoginButton({ children, className, ...props }: KakaoLoginButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-14 w-full cursor-pointer items-center justify-center gap-1.25 rounded-full bg-[#FEE500]",
        className,
      )}
      {...props}>
      <IconKakao className="text-black" />
      <span className="text-black/80 [font:var(--semantic-label-medium)]">{children}</span>
    </button>
  );
}
