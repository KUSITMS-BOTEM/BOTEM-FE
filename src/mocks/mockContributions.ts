import type {
  ContributionStatus,
  PendingContributionResponse,
} from "@/types/contribution/contribution";

type MockContribution = PendingContributionResponse & {
  fundingId: number;
  percentage: number;
};

const MOCK_CONTRIBUTIONS: MockContribution[] = [
  {
    contributionId: 1,
    fundingId: 12,
    senderName: "하린이",
    depositMethod: "토스뱅크 계좌",
    percentage: 10,
  },
  {
    contributionId: 2,
    fundingId: 12,
    senderName: "도윤이",
    depositMethod: "토스뱅크 계좌",
    percentage: 10,
  },
  {
    contributionId: 3,
    fundingId: 15,
    senderName: "서준이",
    depositMethod: "토스뱅크 계좌",
    percentage: 7.5,
  },
  {
    contributionId: 4,
    fundingId: 15,
    senderName: "지아",
    depositMethod: "토스뱅크 계좌",
    percentage: 7.5,
  },
];

const statusById = new Map<number, ContributionStatus>(
  MOCK_CONTRIBUTIONS.map(({ contributionId }) => [contributionId, "PENDING"]),
);

export const getMockPendingContributions = (fundingId: number): PendingContributionResponse[] =>
  MOCK_CONTRIBUTIONS.filter(
    contribution =>
      contribution.fundingId === fundingId &&
      statusById.get(contribution.contributionId) === "PENDING",
  ).map(({ contributionId, senderName, depositMethod }) => ({
    contributionId,
    senderName,
    depositMethod,
  }));

export const updateMockContributionStatuses = (
  fundingId: number,
  contributionIds: number[],
  status: ContributionStatus,
): boolean => {
  if (
    !contributionIds.every(id =>
      MOCK_CONTRIBUTIONS.some(
        contribution => contribution.contributionId === id && contribution.fundingId === fundingId,
      ),
    )
  )
    return false;

  contributionIds.forEach(id => statusById.set(id, status));
  return true;
};

export const getMockContributionProgress = (fundingId: number) => {
  const contributions = MOCK_CONTRIBUTIONS.filter(
    contribution => contribution.fundingId === fundingId,
  );
  return {
    pendingContributionCount: contributions.filter(
      contribution => statusById.get(contribution.contributionId) === "PENDING",
    ).length,
    pendingPercentage: contributions.reduce(
      (sum, contribution) =>
        sum +
        (statusById.get(contribution.contributionId) === "PENDING" ? contribution.percentage : 0),
      0,
    ),
    confirmedAddedPercentage: contributions.reduce(
      (sum, contribution) =>
        sum +
        (statusById.get(contribution.contributionId) === "CONFIRMED" ? contribution.percentage : 0),
      0,
    ),
  };
};
