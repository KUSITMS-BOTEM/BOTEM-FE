import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import HomeMyMenuSheet from "@/widgets/home/HomeMyMenuSheet";

const replace = vi.fn();
let searchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
}));
vi.mock("@/widgets/user/MyMenuSheet", () => ({
  default: ({
    open,
    onClose,
    closedFundingCount,
  }: {
    open: boolean;
    onClose: () => void;
    closedFundingCount: number;
  }) =>
    open ? (
      <div>
        <p>{`메뉴 시트 마감 ${closedFundingCount}`}</p>
        <button type="button" onClick={onClose}>
          닫기
        </button>
      </div>
    ) : null,
}));

describe("HomeMyMenuSheet", () => {
  beforeEach(() => {
    replace.mockClear();
    searchParams = new URLSearchParams();
  });

  it("URL에 menu=open이 있으면 메뉴 시트가 열린다", () => {
    searchParams = new URLSearchParams("menu=open");
    render(<HomeMyMenuSheet closedFundingCount={0} />);

    expect(screen.getByRole("button", { name: "닫기" })).toBeInTheDocument();
  });

  it("쿼리가 없으면 메뉴 시트가 닫혀 있다", () => {
    render(<HomeMyMenuSheet closedFundingCount={0} />);

    expect(screen.queryByRole("button", { name: "닫기" })).not.toBeInTheDocument();
  });

  it("menu 값이 open이 아니면 메뉴 시트가 닫혀 있다", () => {
    searchParams = new URLSearchParams("menu=closed");
    render(<HomeMyMenuSheet closedFundingCount={0} />);

    expect(screen.queryByRole("button", { name: "닫기" })).not.toBeInTheDocument();
  });

  it("시트를 닫으면 쿼리 없는 /home으로 replace한다", async () => {
    searchParams = new URLSearchParams("menu=open");
    render(<HomeMyMenuSheet closedFundingCount={0} />);

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(replace).toHaveBeenCalledWith("/home", { scroll: false });
  });

  it("위시 탭에서 시트를 닫으면 tab 쿼리는 유지한다", async () => {
    searchParams = new URLSearchParams("tab=wish&menu=open");
    render(<HomeMyMenuSheet closedFundingCount={0} />);

    await userEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(replace).toHaveBeenCalledWith("/home?tab=wish", { scroll: false });
  });

  it("마감된 펀딩 수를 시트에 그대로 넘긴다", () => {
    searchParams = new URLSearchParams("menu=open");
    render(<HomeMyMenuSheet closedFundingCount={2} />);

    expect(screen.getByText("메뉴 시트 마감 2")).toBeInTheDocument();
  });
});
