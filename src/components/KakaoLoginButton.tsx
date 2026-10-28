import { type ButtonHTMLAttributes, type ReactNode } from "react";
import Image from "next/image";
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
        "rounded-large inline-flex h-12 w-full items-center justify-center [gap:var(--gap-x-small)] bg-[#FEE500] px-4",
        className,
      )}
      {...props}>
      <Image src="/icons/icon-kakao.png" alt="" width={36} height={36} />
      <span className="text-black/85 [font:var(--semantic-label-medium)]">{children}</span>
    </button>
  );
}
