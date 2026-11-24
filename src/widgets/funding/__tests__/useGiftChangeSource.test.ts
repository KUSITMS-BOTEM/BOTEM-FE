import { renderHook } from "@testing-library/react";

import { useFundingManagementQuery } from "@/hooks/queries/funding/useFundingManagementQuery";
import { useFundingResultQuery } from "@/hooks/queries/funding/useFundingResultQuery";
import { useSurpriseRevealQuery } from "@/hooks/queries/funding/useSurpriseRevealQuery";
import { useGiftChangeSource } from "@/widgets/funding/useGiftChangeSource";

vi.mock("@/hooks/queries/funding/useFundingResultQuery", () => ({
  useFundingResultQuery: vi.fn(),
}));
vi.mock("@/hooks/queries/funding/useFundingManagementQuery", () => ({
  useFundingManagementQuery: vi.fn(),
}));
vi.mock("@/hooks/queries/funding/useSurpriseRevealQuery", () => ({
  useSurpriseRevealQuery: vi.fn(),
}));

const resultRefetch = vi.fn();
const managementRefetch = vi.fn();
const surpriseRefetch = vi.fn();

const mockResult = { confirmedAmount: 501000 };
const mockManagement = {
  product: {
    name: "다이슨 에어랩",
    price: 659000,
    imageUrl: "https://example.com/2.png",
    url: "https://example.com",
  },
  productChanged: true,
};
const mockSurprise = {
  confirmedAmount: 420000,
  productName: "에어팟 프로 2",
  productPrice: 459000,
  productImageUrl: "https://example.com/9.png",
  productChanged: false,
};

type QueryState = { data?: unknown; isLoading?: boolean };

const mockQueries = ({
  result = { data: mockResult } as QueryState,
  management = { data: mockManagement } as QueryState,
  surprise = { data: mockSurprise } as QueryState,
} = {}) => {
  vi.mocked(useFundingResultQuery).mockReturnValue({
    isLoading: false,
    refetch: resultRefetch,
    ...result,
  } as unknown as ReturnType<typeof useFundingResultQuery>);
  vi.mocked(useFundingManagementQuery).mockReturnValue({
    isLoading: false,
    refetch: managementRefetch,
    ...management,
  } as unknown as ReturnType<typeof useFundingManagementQuery>);
  vi.mocked(useSurpriseRevealQuery).mockReturnValue({
    isLoading: false,
    refetch: surpriseRefetch,
    ...surprise,
  } as unknown as ReturnType<typeof useSurpriseRevealQuery>);
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useGiftChangeSource", () => {
  describe("서프라이즈 받는 사람", () => {
    it("공개 상세 쿼리만 켜고 개설자 전용인 결과·관리 상세 쿼리는 끈다", () => {
      mockQueries();
      renderHook(() => useGiftChangeSource(7, true));

      expect(useSurpriseRevealQuery).toHaveBeenCalledWith(7, true);
      expect(useFundingResultQuery).toHaveBeenCalledWith(7, false);
      expect(useFundingManagementQuery).toHaveBeenCalledWith(7, { enabled: false });
    });

    it("공개 상세의 모인 금액·상품·변경 여부로 데이터를 만든다", () => {
      mockQueries();
      const { result } = renderHook(() => useGiftChangeSource(7, true));

      expect(result.current.data).toEqual({
        confirmedAmount: 420000,
        product: { name: "에어팟 프로 2", price: 459000, imageUrl: "https://example.com/9.png" },
        productChanged: false,
      });
    });

    it("공개 상세가 아직 없으면 데이터 없이 공개 상세의 로딩 상태를 따른다", () => {
      mockQueries({ surprise: { data: undefined, isLoading: true } });
      const { result } = renderHook(() => useGiftChangeSource(7, true));

      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(true);
    });

    it("다시 불러오면 공개 상세 쿼리만 다시 부른다", () => {
      mockQueries({ surprise: { data: undefined } });
      const { result } = renderHook(() => useGiftChangeSource(7, true));

      result.current.refetch();

      expect(surpriseRefetch).toHaveBeenCalledTimes(1);
      expect(resultRefetch).not.toHaveBeenCalled();
      expect(managementRefetch).not.toHaveBeenCalled();
    });
  });

  describe("일반 펀딩 개설자", () => {
    it("결과의 모인 금액과 관리 상세의 상품·변경 여부로 데이터를 만든다", () => {
      mockQueries();
      const { result } = renderHook(() => useGiftChangeSource(7, false));

      expect(useSurpriseRevealQuery).toHaveBeenCalledWith(7, false);
      expect(result.current.data).toEqual({
        confirmedAmount: 501000,
        product: { name: "다이슨 에어랩", price: 659000, imageUrl: "https://example.com/2.png" },
        productChanged: true,
      });
    });

    it("결과·관리 상세 중 하나라도 없으면 데이터가 없고, 하나라도 불러오는 중이면 로딩이다", () => {
      mockQueries({ management: { data: undefined, isLoading: true } });
      const { result } = renderHook(() => useGiftChangeSource(7, false));

      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(true);
    });

    it("다시 불러오면 받지 못한 쪽 쿼리만 다시 부른다", () => {
      mockQueries({ result: { data: undefined } });
      const { result } = renderHook(() => useGiftChangeSource(7, false));

      result.current.refetch();

      expect(resultRefetch).toHaveBeenCalledTimes(1);
      expect(managementRefetch).not.toHaveBeenCalled();
      expect(surpriseRefetch).not.toHaveBeenCalled();
    });
  });
});
