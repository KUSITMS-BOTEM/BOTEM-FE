import { useFundingContributionStore } from "../fundingContributionStore";

describe("useFundingContributionStore", () => {
  afterEach(() => {
    useFundingContributionStore.getState().reset();
  });

  it("초기값은 금액 0, 편지 null, 비밀번호 빈 문자열이다", () => {
    const { amount, letter, password } = useFundingContributionStore.getState();

    expect(amount).toBe(0);
    expect(letter).toBeNull();
    expect(password).toBe("");
  });

  it("금액·편지·비밀번호를 각각 저장한다", () => {
    const { setAmount, setLetter, setPassword } = useFundingContributionStore.getState();

    setAmount(50000);
    setLetter({ text: "생일 축하해!", name: "민수", color: "orange", paperStyle: "vividSolid" });
    setPassword("1234");

    expect(useFundingContributionStore.getState()).toMatchObject({
      amount: 50000,
      letter: { text: "생일 축하해!", name: "민수", color: "orange", paperStyle: "vividSolid" },
      password: "1234",
    });
  });

  it("reset하면 저장한 값이 모두 초기값으로 돌아간다", () => {
    const { setAmount, setLetter, setPassword, reset } = useFundingContributionStore.getState();
    setAmount(50000);
    setLetter({ text: "생일 축하해!", name: "민수", color: "orange", paperStyle: "vividSolid" });
    setPassword("1234");

    reset();

    expect(useFundingContributionStore.getState()).toMatchObject({
      amount: 0,
      letter: null,
      password: "",
    });
  });
});
