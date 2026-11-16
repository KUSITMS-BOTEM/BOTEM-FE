import { formatContributedDate } from "@/utils/funding/formatContributedDate";

describe("formatContributedDate", () => {
  it("로컬 날짜를 연.월.일로 보여준다", () => {
    expect(formatContributedDate("2026-12-25T12:00:00")).toBe("2026.12.25");
  });

  it("파싱할 수 없는 값은 빈 문자열을 돌려준다", () => {
    expect(formatContributedDate("not-a-date")).toBe("");
    expect(formatContributedDate("")).toBe("");
  });
});
