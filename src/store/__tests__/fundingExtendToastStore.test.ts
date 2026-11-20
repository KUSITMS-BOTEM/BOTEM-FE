import { useFundingExtendToastStore } from "@/store/fundingExtendToastStore";

describe("useFundingExtendToastStore", () => {
  beforeEach(() => {
    useFundingExtendToastStore.setState({ pending: false });
  });

  it("예약이 없으면 consume은 false를 돌려준다", () => {
    expect(useFundingExtendToastStore.getState().consume()).toBe(false);
  });

  it("mark 뒤 consume은 true를 돌려주고 예약을 비운다", () => {
    useFundingExtendToastStore.getState().mark();

    expect(useFundingExtendToastStore.getState().consume()).toBe(true);
    expect(useFundingExtendToastStore.getState().pending).toBe(false);
  });

  it("한 번 소비하면 다시 consume해도 false다", () => {
    useFundingExtendToastStore.getState().mark();
    useFundingExtendToastStore.getState().consume();

    expect(useFundingExtendToastStore.getState().consume()).toBe(false);
  });
});
