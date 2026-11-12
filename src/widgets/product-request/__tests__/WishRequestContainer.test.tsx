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
