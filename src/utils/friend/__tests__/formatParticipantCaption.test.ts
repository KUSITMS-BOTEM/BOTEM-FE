import { formatParticipantCaption } from "@/utils/friend/formatParticipantCaption";

describe("formatParticipantCaption", () => {
  it("대표 참여자 이름이 없으면 빈 문자열을 반환한다", () => {
    expect(formatParticipantCaption(null, 3)).toBe("");
  });

  it("참여자가 0명이면 빈 문자열을 반환한다", () => {
    expect(formatParticipantCaption("민지", 0)).toBe("");
  });

  it("참여자가 1명이면 '외 n명' 없이 이름만 쓴다", () => {
    expect(formatParticipantCaption("민지", 1)).toBe("민지님 참여중");
  });

  it("참여자가 여러 명이면 대표를 뺀 인원을 '외 n명'으로 쓴다", () => {
    expect(formatParticipantCaption("민지", 7)).toBe("민지님 외 6명 참여중");
  });
});
