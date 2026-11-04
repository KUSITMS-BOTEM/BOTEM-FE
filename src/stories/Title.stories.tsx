import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Title from "@/components/Title";

const meta: Meta<typeof Title> = {
  title: "Components/Title",
  component: Title,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: { disable: true },
  },
  decorators: [
    Story => (
      <div className="w-[320px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Title>;

export const Default: Story = {
  render: () => <Title title="타이틀" description="서브텍스트" />,
};

export const FontTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Title title="타이틀" description="서브텍스트" type="pretendard" />
      <Title title="타이틀" description="서브텍스트" type="a2z" />
    </div>
  ),
};

export const WithButton: Story = {
  render: () => (
    <Title
      title="타이틀"
      description="서브텍스트"
      showButton
      buttonLabel="버튼"
      onButtonClick={() => {}}
    />
  ),
};

export const WithoutDescription: Story = {
  render: () => <Title title="타이틀" />,
};

export const CustomSizes: Story = {
  render: () => (
    <Title title="타이틀" description="서브텍스트" titleSize={28} descriptionSize={17} />
  ),
};

export const MultilineTitle: Story = {
  render: () => <Title title={"첫째 줄\n둘째 줄"} description="서브텍스트" />,
};
