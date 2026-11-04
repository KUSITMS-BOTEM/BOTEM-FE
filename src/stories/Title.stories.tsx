import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Title from "@/components/Title";

const meta = {
  title: "Components/Title",
  component: Title,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    Story => (
      <div className="w-[320px]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    type: { control: "radio", options: ["pretendard", "a2z"] },
    title: { control: "text" },
    description: { control: "text" },
    titleSize: { control: "number" },
    descriptionSize: { control: "number" },
    showButton: { control: "boolean" },
    buttonLabel: { control: "text" },
    onButtonClick: { control: false },
  },
  args: {
    title: "타이틀",
    description: "서브텍스트",
    onButtonClick: () => {},
  },
} satisfies Meta<typeof Title>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FontTypes: Story = {
  render: args => (
    <div className="flex flex-col gap-4">
      <Title {...args} type="pretendard" />
      <Title {...args} type="a2z" />
    </div>
  ),
};

export const WithoutButton: Story = {
  args: {
    showButton: false,
  },
};

export const WithoutDescription: Story = {
  args: {
    description: undefined,
  },
};

export const CustomSizes: Story = {
  args: {
    titleSize: 28,
    descriptionSize: 17,
  },
};

export const MultilineTitle: Story = {
  args: {
    title: "첫째 줄\n둘째 줄",
  },
};
