import { useFundingCloseToastStore } from "@/store/fundingCloseToastStore";

describe("useFundingCloseToastStore", () => {
  beforeEach(() => {
    useFundingCloseToastStore.setState({ pending: false });
  });

  it("예약이 없으면 consume은 false를 돌려준다", () => {
    expect(useFundingCloseToastStore.getState().consume()).toBe(false);
  });

  it("mark 뒤 consume은 true를 돌려주고 예약을 비운다", () => {
    useFundingCloseToastStore.getState().mark();

    expect(useFundingCloseToastStore.getState().consume()).toBe(true);
    expect(useFundingCloseToastStore.getState().pending).toBe(false);
  });

  it("한 번 소비하면 다시 consume해도 false다", () => {
    useFundingCloseToastStore.getState().mark();
    useFundingCloseToastStore.getState().consume();

    expect(useFundingCloseToastStore.getState().consume()).toBe(false);
  });
});
