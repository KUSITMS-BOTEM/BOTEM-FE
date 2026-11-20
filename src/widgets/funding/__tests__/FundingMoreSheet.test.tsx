import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FundingMoreSheet from "@/widgets/funding/FundingMoreSheet";

const renderSheet = (props: Partial<ComponentProps<typeof FundingMoreSheet>> = {}) =>
  render(
    <FundingMoreSheet
      open
      extended={false}
      onClose={vi.fn()}
      onReissueShareCardClick={vi.fn()}
      onCloseEarlyClick={vi.fn()}
      {...props}
    />,
  );

describe("FundingMoreSheet", () => {
  it("연장하지 않은 펀딩이면 한 번 더 연장할 수 있다고 안내한다", async () => {
    renderSheet();

    expect(
      await screen.findByText("마감일이 지나면 한 번 더 연장할 수 있어요"),
    ).toBeInTheDocument();
    expect(screen.queryByText("마감일은 한 번만 연장할 수 있어요")).not.toBeInTheDocument();
  });

  it("이미 연장한 펀딩이면 한 번만 연장할 수 있다고 안내한다", async () => {
    renderSheet({ extended: true });

    expect(await screen.findByText("마감일은 한 번만 연장할 수 있어요")).toBeInTheDocument();
    expect(screen.queryByText("마감일이 지나면 한 번 더 연장할 수 있어요")).not.toBeInTheDocument();
  });

  it("공유 카드 다시 받기를 누르면 onReissueShareCardClick을 호출한다", async () => {
    const onReissueShareCardClick = vi.fn();
    renderSheet({ onReissueShareCardClick });

    await userEvent.click(await screen.findByRole("button", { name: "공유 카드 다시 받기" }));

    expect(onReissueShareCardClick).toHaveBeenCalledTimes(1);
  });

  it("조기 마감하기를 누르면 onCloseEarlyClick을 호출한다", async () => {
    const onCloseEarlyClick = vi.fn();
    renderSheet({ onCloseEarlyClick });

    await userEvent.click(await screen.findByRole("button", { name: /조기 마감하기/ }));

    expect(onCloseEarlyClick).toHaveBeenCalledTimes(1);
  });

  it("조기 마감할 수 없는 펀딩이면 조기 마감하기 메뉴를 숨긴다", async () => {
    renderSheet({ canCloseEarly: false });

    expect(await screen.findByRole("button", { name: "공유 카드 다시 받기" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /조기 마감하기/ })).not.toBeInTheDocument();
  });

  it("공유 카드를 다시 받을 수 없는 펀딩이면 공유 카드 메뉴를 숨긴다", async () => {
    renderSheet({ canReissueShareCard: false });

    expect(await screen.findByRole("button", { name: /조기 마감하기/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "공유 카드 다시 받기" })).not.toBeInTheDocument();
  });
});
