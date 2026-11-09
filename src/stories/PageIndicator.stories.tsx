import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import PageIndicator from "@/widgets/main/PageIndicator";

const meta = {
  title: "Widgets/Main/PageIndicator",
  component: PageIndicator,
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
    total: { control: { type: "number", min: 1, max: 5 } },
    current: { control: { type: "number", min: 1, max: 5 } },
  },
  args: {
    total: 5,
    current: 1,
  },
} satisfies Meta<typeof PageIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllCombinations: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      {[1, 2, 3, 4, 5].flatMap(total =>
        Array.from({ length: total }, (_, index) => (
          <PageIndicator key={`${total}-${index}`} total={total} current={index + 1} />
        )),
      )}
    </div>
  ),
};
