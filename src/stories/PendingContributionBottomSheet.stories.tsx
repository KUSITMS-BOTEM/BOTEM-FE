import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { contributionService } from "@/apis/contribution/contributionService";
import Button from "@/components/Button";
import type { PendingContributionResponse } from "@/types/contribution/contribution";
import PendingContributionBottomSheet from "@/widgets/home/PendingContributionBottomSheet";

const meta: Meta<typeof PendingContributionBottomSheet> = {
  title: "Widgets/Home/PendingContributionBottomSheet",
  component: PendingContributionBottomSheet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: { disable: true },
    docs: { story: { inline: false, height: "720px" } },
  },
};

export default meta;
type Story = StoryObj<typeof PendingContributionBottomSheet>;

const FUNDING_ID = 9;

const CONTRIBUTIONS: PendingContributionResponse[] = [
  { contributionId: 1, senderName: "하린이", depositMethod: "토스뱅크 계좌" },
  { contributionId: 2, senderName: "도윤이", depositMethod: "토스뱅크 계좌" },
  { contributionId: 3, senderName: "서준이", depositMethod: "카카오뱅크 계좌" },
];

type Mode = "default" | "empty" | "loading" | "error";

// Storybook에는 MSW가 없어 서비스 호출을 메모리 스텁으로 바꿔 서버 없이 처리·취소까지 동작시킨다
const originalService = { ...contributionService };

const installStubs = (mode: Mode, pending: PendingContributionResponse[]) => {
  const waitingIds = new Set(mode === "empty" ? [] : pending.map(c => c.contributionId));

  contributionService.getPendingContributions = async () => {
    if (mode === "loading") return new Promise(() => {});
    if (mode === "error") throw new Error("보탬 내역 조회 실패");
    return { contributions: pending.filter(c => waitingIds.has(c.contributionId)) };
  };
  contributionService.updateContributionStatus = async (
    _fundingId,
    { contributionIds, status },
  ) => {
    contributionIds.forEach(id =>
      status === "PENDING" ? waitingIds.add(id) : waitingIds.delete(id),
    );
    return null;
  };
};

const restoreStubs = () => {
  Object.assign(contributionService, originalService);
};

function PendingContributionBottomSheetDemo({ mode }: { mode: Mode }) {
  const [open, setOpen] = useState(true);
  const [queryClient] = useState(() => {
    installStubs(mode, CONTRIBUTIONS);
    return new QueryClient({ defaultOptions: { queries: { retry: false } } });
  });

  // StrictMode가 effect를 한 번 정리했다 다시 실행해도 스텁이 유지되도록 여기서도 설치한다
  useEffect(() => {
    installStubs(mode, CONTRIBUTIONS);
    return restoreStubs;
  }, [mode]);

  return (
    <QueryClientProvider client={queryClient}>
      <Button onClick={() => setOpen(true)}>입금 확인 열기</Button>
      <PendingContributionBottomSheet
        open={open}
        fundingId={FUNDING_ID}
        onClose={() => setOpen(false)}
      />
    </QueryClientProvider>
  );
}

export const Default: Story = {
  render: () => <PendingContributionBottomSheetDemo mode="default" />,
};

export const AllConfirmed: Story = {
  render: () => <PendingContributionBottomSheetDemo mode="empty" />,
};

export const Loading: Story = {
  render: () => <PendingContributionBottomSheetDemo mode="loading" />,
};

export const LoadFailed: Story = {
  render: () => <PendingContributionBottomSheetDemo mode="error" />,
};
