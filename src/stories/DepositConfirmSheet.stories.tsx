import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { contributionService } from "@/apis/contribution/contributionService";
import Button from "@/components/Button";
import type {
  ContributionDecisionResult,
  PendingContributionResponse,
} from "@/types/contribution/contribution";
import DepositConfirmSheet from "@/widgets/funding/DepositConfirmSheet";

const meta: Meta<typeof DepositConfirmSheet> = {
  title: "Widgets/Funding/DepositConfirmSheet",
  component: DepositConfirmSheet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: { disable: true },
    docs: { story: { inline: false, height: "700px" } },
  },
};

export default meta;
type Story = StoryObj<typeof DepositConfirmSheet>;

const FUNDING_ID = 12;

const contribution = (
  contributionId: number,
  participantName: string,
  participatedAt: string,
  amount = 45000,
): PendingContributionResponse => ({
  contributionId,
  participantName,
  profileImageUrl: null,
  participatedAt,
  amount,
});

const CONTRIBUTIONS = [
  contribution(1, "김하린이", "2026-11-18T11:20:00"),
  contribution(2, "김하린이", "2026-11-16T11:20:00"),
  contribution(3, "김하린이", "2026-11-16T09:10:00"),
  contribution(4, "박도윤", "2026-11-14T21:45:00", 30000),
];

const PROGRESS = {
  confirmedPercentage: 50,
  pendingPercentage: 0,
  pendingContributionCount: 0,
  targetReached: false,
};

// Storybook에는 MSW가 없어 서비스 호출을 메모리 스텁으로 바꿔 서버 없이 처리까지 동작시킨다
const originalService = { ...contributionService };

const installStubs = (pending: PendingContributionResponse[]) => {
  const waitingIds = new Set(pending.map(c => c.contributionId));

  contributionService.getPendingContributions = async () => {
    const contributions = pending.filter(c => waitingIds.has(c.contributionId));
    return { pendingContributionCount: contributions.length, contributions };
  };
  contributionService.decideContributions = async (_fundingId, { contributionIds, decision }) => {
    const status = decision === "CONFIRM" ? "CONFIRMED" : "REJECTED";
    const contributions = contributionIds.map(contributionId => ({
      contributionId,
      status,
      changed: waitingIds.delete(contributionId),
    })) satisfies ContributionDecisionResult[];
    return { contributions, progress: PROGRESS };
  };
  contributionService.undoContributionDecisions = async (_fundingId, { contributionIds }) => {
    const contributions = contributionIds.map(contributionId => {
      const changed = !waitingIds.has(contributionId);
      waitingIds.add(contributionId);
      return { contributionId, status: "PENDING_CONFIRMATION" as const, changed };
    });
    return { contributions, progress: PROGRESS };
  };
};

const restoreStubs = () => {
  Object.assign(contributionService, originalService);
};

function DepositConfirmSheetDemo({
  contributions,
  preReveal = false,
}: {
  contributions: PendingContributionResponse[];
  preReveal?: boolean;
}) {
  const [open, setOpen] = useState(true);
  const [queryClient] = useState(() => {
    installStubs(contributions);
    return new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  // StrictMode가 effect를 한 번 정리했다 다시 실행해도 스텁이 유지되도록 여기서도 설치한다
  useEffect(() => {
    installStubs(contributions);
    return restoreStubs;
  }, [contributions]);

  return (
    <QueryClientProvider client={queryClient}>
      <Button onClick={() => setOpen(true)}>입금 확인 열기</Button>
      {preReveal ? (
        <DepositConfirmSheet
          variant="preReveal"
          open={open}
          fundingId={FUNDING_ID}
          onClose={() => setOpen(false)}
          onReveal={() => setOpen(false)}
        />
      ) : (
        <DepositConfirmSheet open={open} fundingId={FUNDING_ID} onClose={() => setOpen(false)} />
      )}
    </QueryClientProvider>
  );
}

export const Default: Story = {
  render: () => <DepositConfirmSheetDemo contributions={CONTRIBUTIONS} />,
};

export const Empty: Story = {
  render: () => <DepositConfirmSheetDemo contributions={[]} />,
};

export const PreReveal: Story = {
  render: () => <DepositConfirmSheetDemo contributions={CONTRIBUTIONS} preReveal />,
};

export const PreRevealAllConfirmed: Story = {
  render: () => <DepositConfirmSheetDemo contributions={[]} preReveal />,
};
