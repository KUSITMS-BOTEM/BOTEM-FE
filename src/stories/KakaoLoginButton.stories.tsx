import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import KakaoLoginButton from "@/components/KakaoLoginButton";

const meta = {
  title: "Components/KakaoLoginButton",
  component: KakaoLoginButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    Story => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    children: { control: "text" },
  },
  args: {
    children: "카카오 로그인",
  },
} satisfies Meta<typeof KakaoLoginButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ShortLabel: Story = {
  args: {
    children: "로그인",
  },
};
