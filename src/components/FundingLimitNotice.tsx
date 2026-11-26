// 개설 한도 때문에 비활성화한 CTA 위에 둔다 (BottomCTA upper)
export default function FundingLimitNotice() {
  return (
    <p className="text-semantic-text-tertiary text-center [letter-spacing:var(--letter-spacing-default)] [font:var(--semantic-label-x-small-weak)]">
      펀딩은 최대 5개까지만 열 수 있어요
    </p>
  );
}
