import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import IconButton from "@/components/IconButton";

const RightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="size-full">
    <path
      d="M9 6l6 6-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const meta = {
  title: "Components/IconButton",
  component: IconButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    icon: { control: false },
  },
  args: {
    icon: <RightIcon />,
    "aria-label": "다음",
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <IconButton size="small" icon={<RightIcon />} aria-label="다음" />
      <IconButton size="medium" icon={<RightIcon />} aria-label="다음" />
      <IconButton size="large" icon={<RightIcon />} aria-label="다음" />
      <IconButton size="xlarge" icon={<RightIcon />} aria-label="다음" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex gap-2">
      <IconButton variant="ghost" icon={<RightIcon />} aria-label="다음" />
      <IconButton variant="stroke" icon={<RightIcon />} aria-label="다음" />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
