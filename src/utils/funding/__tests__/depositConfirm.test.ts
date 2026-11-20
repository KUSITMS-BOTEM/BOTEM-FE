import {
  type DepositItem,
  formatDepositDate,
  formatDepositTime,
  getDepositToastText,
  groupDepositsByDate,
} from "@/utils/funding/depositConfirm";

const deposit = (id: number, depositedAt: string): DepositItem => ({
  id,
  senderName: `보낸이${id}`,
  depositedAt,
  amount: 10000,
});

describe("formatDepositDate / formatDepositTime", () => {
  it("월·일은 0 없이, 시간은 두 자리로 맞춘다", () => {
    expect(formatDepositDate("2026-11-08T09:05:00")).toBe("11월 8일");
    expect(formatDepositTime("2026-11-08T09:05:00")).toBe("09:05");
  });

  it("파싱이 안 되는 값은 빈 문자열이다", () => {
    expect(formatDepositDate("invalid")).toBe("");
    expect(formatDepositTime("invalid")).toBe("");
  });
});

describe("groupDepositsByDate", () => {
  it("같은 날짜끼리 묶고 입력 순서를 유지한다", () => {
    const groups = groupDepositsByDate([
      deposit(1, "2026-11-18T11:20:00"),
      deposit(2, "2026-11-16T11:20:00"),
      deposit(3, "2026-11-16T09:00:00"),
    ]);

    expect(groups.map(group => group.dateLabel)).toEqual(["11월 18일", "11월 16일"]);
    expect(groups[1].deposits.map(item => item.id)).toEqual([2, 3]);
  });

  it("빈 배열이면 빈 배열을 돌려준다", () => {
    expect(groupDepositsByDate([])).toEqual([]);
  });
});

describe("getDepositToastText", () => {
  it.each([
    ["received", 2, 3, "2건의 입금을 모두 확인했어요"],
    ["received", 3, 3, "모든 건의 입금을 확인했어요"],
    ["notReceived", 1, 3, "1건의 입금을 못받음 처리했어요"],
    ["notReceived", 3, 3, "모든 건의 입금을 못받음 처리했어요"],
  ] as const)("%s, %i/%i건이면 '%s'", (action, processed, total, expected) => {
    expect(getDepositToastText(action, processed, total)).toBe(expected);
  });
});
