import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SegmentControl from "@/widgets/main/SegmentControl";

describe("SegmentControl", () => {
  it("펀딩/위시 탭 2개가 tablist 안에 렌더된다", () => {
    render(<SegmentControl />);

    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(screen.getByRole("tab", { name: "펀딩" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "위시" })).toBeInTheDocument();
  });

  it("처음에는 펀딩 탭이 선택되어 있다", () => {
    render(<SegmentControl />);

    expect(screen.getByRole("tab", { name: "펀딩" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "위시" })).toHaveAttribute("aria-selected", "false");
  });

  it("위시 탭을 클릭하면 위시로, 다시 펀딩 탭을 클릭하면 펀딩으로 전환된다", async () => {
    const user = userEvent.setup();
    render(<SegmentControl />);

    await user.click(screen.getByRole("tab", { name: "위시" }));
    expect(screen.getByRole("tab", { name: "위시" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "펀딩" })).toHaveAttribute("aria-selected", "false");

    await user.click(screen.getByRole("tab", { name: "펀딩" }));
    expect(screen.getByRole("tab", { name: "펀딩" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "위시" })).toHaveAttribute("aria-selected", "false");
  });

  it("탭을 클릭하면 onChange가 선택한 값으로 호출된다", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<SegmentControl onChange={handleChange} />);

    await user.click(screen.getByRole("tab", { name: "위시" }));
    await user.click(screen.getByRole("tab", { name: "펀딩" }));

    expect(handleChange).toHaveBeenNthCalledWith(1, "wish");
    expect(handleChange).toHaveBeenNthCalledWith(2, "funding");
  });

  it("onChange 없이도 클릭으로 전환된다", async () => {
    const user = userEvent.setup();
    render(<SegmentControl />);

    await user.click(screen.getByRole("tab", { name: "위시" }));

    expect(screen.getByRole("tab", { name: "위시" })).toHaveAttribute("aria-selected", "true");
  });

  it("선택된 탭만 Tab 순서에 포함된다", () => {
    render(<SegmentControl />);

    expect(screen.getByRole("tab", { name: "펀딩" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("tab", { name: "위시" })).toHaveAttribute("tabindex", "-1");
  });

  it("좌우 화살표 키로 탭을 이동하며 선택하고 포커스를 옮긴다", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<SegmentControl onChange={handleChange} />);

    screen.getByRole("tab", { name: "펀딩" }).focus();
    await user.keyboard("{ArrowRight}");
    const wishTab = screen.getByRole("tab", { name: "위시" });
    expect(wishTab).toHaveAttribute("aria-selected", "true");
    expect(wishTab).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    const fundingTab = screen.getByRole("tab", { name: "펀딩" });
    expect(fundingTab).toHaveAttribute("aria-selected", "true");
    expect(fundingTab).toHaveFocus();
    expect(handleChange).toHaveBeenNthCalledWith(1, "wish");
    expect(handleChange).toHaveBeenNthCalledWith(2, "funding");
  });
});
