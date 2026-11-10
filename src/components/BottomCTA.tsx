import { type ReactNode } from "react";
import { cn } from "@/utils/cn";
import Satets from "@/components/Satets";
import { APP_MAX_WIDTH_CLASS } from "@/constants/layout";
import LogoKakao from "@/assets/icons/multicolor/logo-kakao.svg?react";

type DefaultButtonAreaProps = {
  type?: "default";
  children: ReactNode;
  direction?: "horizontal" | "vertical";
  onClick?: never;
};

type KakaoButtonAreaProps = {
  type: "kakao";
  onClick: () => void;
  children?: never;
  direction?: never;
};

type BottomCTAProps = (DefaultButtonAreaProps | KakaoButtonAreaProps) & {
  upper?: ReactNode;
  lower?: ReactNode;
  className?: string;
};

export default function BottomCTA({ upper, lower, className, ...props }: BottomCTAProps) {
  const direction = props.type === "kakao" ? "horizontal" : (props.direction ?? "horizontal");

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-10 mx-auto flex w-full flex-col",
        APP_MAX_WIDTH_CLASS,
        className,
      )}>
      <div
        aria-hidden
        className="to-semantic-background-default h-9 w-full bg-linear-to-b from-transparent"
      />
      <div className="bg-semantic-background-default pointer-events-auto flex w-full flex-col pb-[calc(var(--padding-large)+env(safe-area-inset-bottom))]">
        {upper && <div className="flex justify-center px-6 pb-6">{upper}</div>}
        <div
          className={cn(
            "flex gap-2 px-5",
            direction === "horizontal" ? "*:min-w-24 *:flex-1" : "flex-col *:w-full",
          )}>
          {props.type === "kakao" ? (
            <button
              type="button"
              onClick={props.onClick}
              className="group relative inline-flex h-14 cursor-pointer items-center justify-center gap-[5px] rounded-full bg-[#fee500] px-6 [letter-spacing:var(--letter-spacing-default)] whitespace-nowrap text-black/80 transition-transform [font:var(--semantic-label-medium)] active:scale-95">
              <Satets color="black" className="rounded-full" />
              <span aria-hidden className="relative z-10 flex size-5 justify-center pt-1">
                <LogoKakao />
              </span>
              <span className="relative z-10">카카오로 이용하기</span>
            </button>
          ) : (
            props.children
          )}
        </div>
        {lower && <div className="flex justify-center px-6 pt-6">{lower}</div>}
      </div>
    </div>
  );
}
