import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import MenuDropdown from "@/widgets/main/MenuDropdown";
import IconWishAdd from "@/assets/icons/multicolor/icon-wish-add.svg?react";
import IconFundingOpen from "@/assets/icons/multicolor/icon-funding-open.svg?react";

const meta = {
  title: "Widgets/Main/MenuDropdown",
  component: MenuDropdown,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
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
} satisfies Meta<typeof MenuDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutLink: Story = {
  args: {
    items: [
      { icon: <IconWishAdd />, label: "위시 추가" },
      { icon: <IconFundingOpen />, label: "펀딩 추가" },
    ],
  },
};

export const LongLabel: Story = {
  args: {
    items: [
      { icon: <IconWishAdd />, label: "위시 추가", href: "#" },
      { icon: <IconFundingOpen />, label: "아주 긴 메뉴 이름 예시", href: "#" },
    ],
  },
};
