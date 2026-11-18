import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { useRequestProductMutation } from "@/hooks/mutations/product-request/useRequestProductMutation";
import { ApiError } from "@/types/api";
import WishRequestContainer from "@/widgets/product-request/WishRequestContainer";

vi.mock("@/hooks/mutations/product-request/useRequestProductMutation", () => ({
  useRequestProductMutation: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), back: vi.fn() }) }));

const submitWithError = async (error: Error) => {
  vi.mocked(useRequestProductMutation).mockReturnValue({
    mutate: (_body: unknown, options: { onError?: (e: Error) => void; onSettled?: () => void }) => {
      options.onError?.(error);
      options.onSettled?.();
    },
    isPending: false,
  } as unknown as ReturnType<typeof useRequestProductMutation>);
  render(<WishRequestContainer />);
  await userEvent.type(
    screen.getByPlaceholderText("링크를 붙여넣어주세요"),
    "https://www.coupang.com/vp/products/1",
  );
  await userEvent.click(screen.getByRole("button", { name: "요청 보내기" }));
};

describe("WishRequestContainer 서버 에러", () => {
  it("inline 코드(PRODUCT_004)는 Toast로 테이블 문구를 보여준다", async () => {
    await submitWithError(new ApiError("PRODUCT_004"));
    await waitFor(() =>
      expect(screen.getByText(ERROR_MESSAGES.PRODUCT_004.message)).toBeInTheDocument(),
    );
  });

  it("inline이 아닌 코드는 Toast를 띄우지 않는다", async () => {
    await submitWithError(new ApiError("PRODUCT_002"));
    expect(screen.queryByText(ERROR_MESSAGES.PRODUCT_002.message)).not.toBeInTheDocument();
  });
});

describe("WishRequestContainer 링크 검증", () => {
  it("쿠팡 링크가 아니면 필드에 에러 문구를 보이고 요청 버튼을 잠근다", async () => {
    vi.mocked(useRequestProductMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useRequestProductMutation>);
    render(<WishRequestContainer />);
    const input = screen.getByPlaceholderText("링크를 붙여넣어주세요");
    await userEvent.type(input, "치이카와 인형");
    await userEvent.click(screen.getByRole("button", { name: "요청 보내기" }));

    expect(screen.getByText("잘못된 형식의 링크예요")).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("button", { name: "요청 보내기" })).toBeDisabled();

    // 여전히 잘못된 값이면 에러가 유지되고, 올바른 링크가 되면 사라진다
    await userEvent.type(input, "!");
    expect(screen.getByText("잘못된 형식의 링크예요")).toBeInTheDocument();
    await userEvent.clear(input);
    await userEvent.type(input, "https://www.coupang.com/vp/products/1");
    expect(screen.queryByText("잘못된 형식의 링크예요")).not.toBeInTheDocument();
  });
});
