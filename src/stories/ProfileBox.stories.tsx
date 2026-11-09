import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ProfileBox from "@/widgets/main/ProfileBox";

const meta = {
  title: "Widgets/Main/ProfileBox",
  component: ProfileBox,
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
    profiles: { control: "check", options: ["orange", "lime", "pink"] },
    extraCount: { control: { type: "number", min: 0 } },
    notification: { control: "boolean" },
  },
  args: {
    profiles: ["orange"],
    extraCount: 99,
    notification: false,
  },
} satisfies Meta<typeof ProfileBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Notification: Story = {
  args: { notification: true },
};

export const ThreeProfiles: Story = {
  args: { profiles: ["orange", "lime", "pink"] },
};

export const WithoutExtraCount: Story = {
  args: { profiles: ["orange", "lime"], extraCount: 0 },
};
