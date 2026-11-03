import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import SelectBox from "@/components/SelectBox";

const meta = {
  title: "Components/SelectBox",
  component: SelectBox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    Story => (
      <div className="w-[373px]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: { control: "inline-radio", options: ["select", "birth"] },
    helperText: { control: "text" },
  },
  args: {
    label: "레이블",
    helperText: "Help Text",
  },
} satisfies Meta<typeof SelectBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: {
    value: "옵션 1",
  },
};

export const Birth: Story = {
  args: {
    variant: "birth",
  },
};

export const BirthFilled: Story = {
  args: {
    variant: "birth",
    value: "1990.01.01",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithoutHelperText: Story = {
  args: {
    helperText: undefined,
  },
};

export const LongValue: Story = {
  args: {
    value: "아주 긴 옵션 이름이 들어가면 말줄임 처리되는지 확인하기 위한 텍스트",
  },
};
