import { render } from "@testing-library/react";

import NotFound from "../not-found";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

describe("NotFound", () => {
  it("존재하지 않는 경로에 접근하면 랜딩 페이지로 replace한다", () => {
    render(<NotFound />);

    expect(replace).toHaveBeenCalledWith("/");
  });
});
