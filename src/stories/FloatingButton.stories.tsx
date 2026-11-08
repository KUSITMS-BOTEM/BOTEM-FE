import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import FloatingButton from "@/widgets/main/FloatingButton";
import IconWishAdd from "@/assets/icons/multicolor/icon-wish-add.svg?react";
import IconFundingOpen from "@/assets/icons/multicolor/icon-funding-open.svg?react";

const meta = {
  title: "Widgets/Main/FloatingButton",
  component: FloatingButton,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    // transform으로 containing block을 만들어 fixed 버튼이 뷰포트 대신 이 박스 하단에 붙게 한다(autodocs 겹침 방지)
    Story => (
      <div className="mx-auto min-h-70 w-110 transform-[translateZ(0)]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    items: { control: false },
    onSelect: { control: false },
  },
  args: {
    items: [
      { icon: <IconWishAdd />, label: "위시 추가", href: "#" },
      { icon: <IconFundingOpen />, label: "펀딩 추가", href: "#" },
    ],
  },
} satisfies Meta<typeof FloatingButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// Opened는 클릭해야 보이는 배리언트2 + 드롭다운이라 스토리가 열리면 버튼을 클릭한다
const openMenu: Story["play"] = async ({ canvas, userEvent }) => {
  await userEvent.click(canvas.getByRole("button", { name: "추가 메뉴 열기" }));
};

export const Opened: Story = {
  play: openMenu,
};
