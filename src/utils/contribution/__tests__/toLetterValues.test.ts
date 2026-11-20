import { toLetterValues } from "@/utils/contribution/toLetterValues";
import { toMessageContributionRequest } from "@/utils/contribution/toMessageContributionRequest";

const saved = {
  participantName: "민지",
  message: "축하해",
  paperTemplateCode: "",
  decorationCode: null,
};

describe("toLetterValues", () => {
  it("toMessageContributionRequest로 만든 코드를 편지 값으로 되돌린다", () => {
    const letter = {
      text: "축하해",
      name: "민지",
      color: "pink",
      paperStyle: "dotGrid",
      largeSticker: { id: "party-popper" },
      smallSticker: { id: "heart" },
    };
    const { paperTemplateCode, decorationCode } = toMessageContributionRequest(letter, {
      requestKey: "k",
    });

    expect(
      toLetterValues({ ...saved, paperTemplateCode, decorationCode: decorationCode ?? null }),
    ).toMatchObject({
      text: "축하해",
      name: "민지",
      color: "pink",
      paperStyle: "dotGrid",
      largeSticker: { id: "party-popper" },
      smallSticker: { id: "heart" },
    });
  });

  it("알 수 없는 코드는 기본 편지지·스티커 없음으로 둔다", () => {
    const values = toLetterValues({
      ...saved,
      paperTemplateCode: "BLACK_CONFETTI",
      decorationCode: "HEART|??",
    });

    expect(values).toMatchObject({
      color: "orange",
      paperStyle: "vividSolid",
      largeSticker: { id: "heart" },
    });
    expect(values).not.toHaveProperty("smallSticker");
  });
});
