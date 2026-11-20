import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import SegmentControl, { type SegmentValue } from "@/widgets/home/SegmentControl";

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
    value: { control: "inline-radio", options: ["funding", "wish"] },
    onChange: { control: false },
  },
  args: {
    value: "funding",
    onChange: fn(),
  },
  render: function Render(args) {
    const [value, setValue] = useState<SegmentValue>(args.value);
    return (
      <SegmentControl
        {...args}
        value={value}
        onChange={next => {
          setValue(next);
          args.onChange(next);
        }}
      />
    );
  },
} satisfies Meta<typeof SegmentControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
