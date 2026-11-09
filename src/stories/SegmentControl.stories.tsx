import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import SegmentControl from "@/widgets/main/SegmentControl";

const meta = {
  title: "Widgets/Main/SegmentControl",
  component: SegmentControl,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    Story => (
      <div className="bg-semantic-background-lower p-10">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    onChange: { control: false },
  },
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof SegmentControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
