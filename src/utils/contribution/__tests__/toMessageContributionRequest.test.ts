import { toMessageContributionRequest } from "@/utils/contribution/toMessageContributionRequest";

const letter = { text: "축하해", name: "민지", color: "orange", paperStyle: "vividSolid" };

describe("toMessageContributionRequest", () => {
  it("색·스타일을 paperTemplateCode로 합치고 스티커가 없으면 decorationCode를 생략한다", () => {
    expect(toMessageContributionRequest(letter, { requestKey: "k" })).toEqual({
      requestKey: "k",
      message: "축하해",
      paperTemplateCode: "ORANGE_VIVID_SOLID",
      decorationCode: undefined,
    });
  });

  it("스티커는 `큰|작은` 형식이고 한쪽만 있으면 빈 자리를 남긴다", () => {
    const both = toMessageContributionRequest(
      { ...letter, largeSticker: { id: "party-popper" }, smallSticker: { id: "heart" } },
      { requestKey: "k" },
    );
    const smallOnly = toMessageContributionRequest(
      { ...letter, smallSticker: { id: "heart" } },
      { requestKey: "k" },
    );
    expect(both.decorationCode).toBe("PARTY_POPPER|HEART");
    expect(smallOnly.decorationCode).toBe("|HEART");
  });

  it("비밀번호가 있을 때(비회원)만 이름·비밀번호를 보낸다", () => {
    expect(toMessageContributionRequest(letter, { requestKey: "k" })).not.toHaveProperty(
      "participantName",
    );
    expect(
      toMessageContributionRequest(letter, { requestKey: "k", guestPassword: "1234" }),
    ).toMatchObject({ participantName: "민지", guestPassword: "1234" });
  });
});
