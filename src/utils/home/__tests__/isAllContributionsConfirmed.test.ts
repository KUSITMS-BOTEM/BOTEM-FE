import { isAllContributionsConfirmed } from "@/utils/home/isAllContributionsConfirmed";

const confirmed = {
  open: true,
  pendingCount: 0,
  toastCount: 0,
  isFetching: false,
  isUpdating: false,
};

describe("isAllContributionsConfirmed", () => {
  it("열려 있고 확인 대기·토스트·요청·조회가 모두 없으면 true", () => {
    expect(isAllContributionsConfirmed(confirmed)).toBe(true);
  });

  it.each([
    ["시트가 닫혀 있으면", { open: false }],
    ["목록을 아직 못 받았으면", { pendingCount: undefined }],
    ["확인 대기 보탬이 남아 있으면", { pendingCount: 1 }],
    ["취소하기 토스트가 떠 있으면", { toastCount: 1 }],
    ["목록을 다시 조회 중이면", { isFetching: true }],
    ["상태 변경 요청이 진행 중이면", { isUpdating: true }],
  ])("%s false", (_, override) => {
    expect(isAllContributionsConfirmed({ ...confirmed, ...override })).toBe(false);
  });
});
