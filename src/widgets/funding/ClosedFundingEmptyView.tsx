import EmptyGift from "@/assets/icons/multicolor/empty-gift.svg?react";

export default function ClosedFundingEmptyView() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 pb-20 text-center [letter-spacing:var(--letter-spacing-default)]">
      <EmptyGift aria-hidden />
      <p className="text-semantic-text-tertiary [font:var(--semantic-title-x-small)]">
        아직 끝난 펀딩이 없어요
      </p>
      <p className="text-semantic-text-quaternary whitespace-pre-line [font:var(--semantic-subtext-medium)]">
        {"펀딩이 마감되면 이곳에\n추억과 롤링페이퍼가 차곡차곡 쌓여요"}
      </p>
    </div>
  );
}
