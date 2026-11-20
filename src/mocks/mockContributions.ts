import type {
  ContributionDecisionStatus,
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
    participantName: "하린",
    profileImageUrl: null,
    participatedAt: "2026-11-18T11:20:00",
    percentage: 10,
  },
  {
    contributionId: 2,
    fundingId: 12,
    participantName: "도윤",
    profileImageUrl: null,
    participatedAt: "2026-11-16T09:05:00",
    percentage: 10,
  },
  {
    contributionId: 3,
    fundingId: 15,
    participantName: "서준",
    profileImageUrl: null,
    participatedAt: "2026-11-19T20:10:00",
    percentage: 7.5,
  },
  {
    contributionId: 4,
    fundingId: 15,
    participantName: "지아",
    profileImageUrl: null,
    participatedAt: "2026-11-19T08:40:00",
    percentage: 7.5,
  },
  {
    contributionId: 5,
    fundingId: 17,
    participantName: "민지",
    profileImageUrl: null,
    participatedAt: "2026-11-20T14:03:00",
    percentage: 5,
  },
  {
    contributionId: 6,
    fundingId: 17,
    participantName: "예준",
    profileImageUrl: null,
    participatedAt: "2026-11-18T21:45:00",
    percentage: 5,
  },
  {
    contributionId: 7,
    fundingId: 18,
    participantName: "수아",
    profileImageUrl: null,
    participatedAt: "2026-11-19T12:30:00",
    percentage: 5,
  },
  {
    contributionId: 8,
    fundingId: 18,
    participantName: "지우",
    profileImageUrl: null,
    participatedAt: "2026-11-19T10:15:00",
    percentage: 5,
  },
];

const statusById = new Map<number, ContributionDecisionStatus>(
  MOCK_CONTRIBUTIONS.map(({ contributionId }) => [contributionId, "PENDING_CONFIRMATION"]),
);

const statusOf = (contributionId: number) => statusById.get(contributionId);

const contributionsOf = (fundingId: number) =>
  MOCK_CONTRIBUTIONS.filter(contribution => contribution.fundingId === fundingId);

export const getMockPendingContributions = (fundingId: number): PendingContributionResponse[] =>
  contributionsOf(fundingId)
    .filter(({ contributionId }) => statusOf(contributionId) === "PENDING_CONFIRMATION")
    .map(({ contributionId, participantName, profileImageUrl, participatedAt }) => ({
      contributionId,
      participantName,
      profileImageUrl,
      participatedAt,
    }));

export const getMockPendingContributionIds = (fundingId: number): number[] =>
  getMockPendingContributions(fundingId).map(({ contributionId }) => contributionId);

export const getMockContributionStatus = (
  fundingId: number,
  contributionId: number,
): ContributionDecisionStatus | null =>
  contributionsOf(fundingId).some(contribution => contribution.contributionId === contributionId)
    ? (statusOf(contributionId) ?? null)
    : null;

export const getMockContributionRecords = (fundingId: number) =>
  contributionsOf(fundingId).map(contribution => ({
    ...contribution,
    status: statusOf(contribution.contributionId) ?? "PENDING_CONFIRMATION",
  }));

export const updateMockContributionStatuses = (
  fundingId: number,
  contributionIds: number[],
  status: ContributionDecisionStatus,
): boolean => {
  const fundingContributions = contributionsOf(fundingId);
  if (
    !contributionIds.every(id =>
      fundingContributions.some(contribution => contribution.contributionId === id),
    )
  )
    return false;

  contributionIds.forEach(id => statusById.set(id, status));
  return true;
};

const sumPercentage = (fundingId: number, status: ContributionDecisionStatus) =>
  contributionsOf(fundingId).reduce(
    (sum, contribution) =>
      sum + (statusOf(contribution.contributionId) === status ? contribution.percentage : 0),
    0,
  );

export const getMockContributionProgress = (fundingId: number) => ({
  pendingContributionCount: getMockPendingContributionIds(fundingId).length,
  pendingPercentage: sumPercentage(fundingId, "PENDING_CONFIRMATION"),
  confirmedAddedPercentage: sumPercentage(fundingId, "CONFIRMED"),
});
