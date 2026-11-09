import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ProgressBar from "@/widgets/main/ProgressBar";

const meta = {
  title: "Widgets/Main/ProgressBar",
  component: ProgressBar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    Story => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    progress: { control: { type: "range", min: 0, max: 100, step: 1 } },
  },
  args: {
    progress: 56,
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllSteps: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      {[0, 10, 20, 30, 40, 50, 56, 60, 70, 80, 90, 100].map(progress => (
        <ProgressBar key={progress} progress={progress} />
      ))}
    </div>
  ),
};
