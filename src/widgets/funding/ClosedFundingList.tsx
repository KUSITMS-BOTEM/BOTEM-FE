import FundedCard from "@/widgets/funding/FundedCard";
import ListHeader from "@/components/ListHeader";
import type { ClosedFundingResponse } from "@/types/funding/closedFunding";

type ClosedFundingListProps = {
  fundings: ClosedFundingResponse[];
};

// "2025-10-13T23:59:59" → "2025.10.13"
const formatDeadline = (deadline: string) => deadline.slice(0, 10).replaceAll("-", ".");

// 서버가 마감일 최근순으로 내려주므로 같은 날짜끼리 인접해 있다
function groupByDeadline(fundings: ClosedFundingResponse[]) {
  const groups: { date: string; items: ClosedFundingResponse[] }[] = [];
  for (const funding of fundings) {
    const date = formatDeadline(funding.deadline);
    const last = groups.at(-1);
    if (last?.date === date) last.items.push(funding);
    else groups.push({ date, items: [funding] });
  }
  return groups;
}

export default function ClosedFundingList({ fundings }: ClosedFundingListProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      {groupByDeadline(fundings).map(({ date, items }) => (
        <section key={date} className="flex w-full flex-col">
          <ListHeader title={date} as="h3" />
          <ul>
            {items.map(funding => (
              <li key={funding.fundingId}>
                <FundedCard
                  productName={funding.productName}
                  productImageUrl={funding.productImageUrl}
                  relationship={funding.relationship}
                  fundingType={funding.fundingType}
                  celebrantName={funding.celebrantName}
                  rollingPaperCount={funding.rollingPaperCount}
                  href={
                    funding.relationship === "OPENED" ? `/funding/${funding.fundingId}` : undefined
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
