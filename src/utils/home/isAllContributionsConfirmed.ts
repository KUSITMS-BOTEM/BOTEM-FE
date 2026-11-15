type AllContributionsConfirmedState = {
  open: boolean;
  pendingCount: number | undefined;
  toastCount: number;
  isFetching: boolean;
  isUpdating: boolean;
};

// 취소하기 토스트가 떠 있거나 상태 변경 요청·재조회가 진행 중이면 아직 되돌려질 수 있으므로 완료로 보지 않는다
export const isAllContributionsConfirmed = ({
  open,
  pendingCount,
  toastCount,
  isFetching,
  isUpdating,
}: AllContributionsConfirmedState) =>
  open && pendingCount === 0 && toastCount === 0 && !isFetching && !isUpdating;
