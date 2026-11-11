import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import InfoBox from "@/components/InfoBox";

const meta = {
  title: "Components/InfoBox",
  component: InfoBox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    text: { control: "text" },
    className: { control: false },
  },
  args: {
    text: "안내 문구를 입력하세요.",
  },
  decorators: [
    Story => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InfoBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongText: Story = {
  args: {
    text: "문구가 길어지면 아이콘은 그대로 두고 텍스트만 여러 줄로 줄바꿈됩니다. 박스 높이는 텍스트에 맞춰 늘어납니다.",
  },
};
