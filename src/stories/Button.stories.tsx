import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Button from "@/components/Button";

const PlaceholderIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="size-full">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    children: { control: "text" },
    leftIcon: { control: false },
    rightIcon: { control: false },
    // color·variant는 조합에 제약이 있는 discriminated union이라(brand·danger는 fill·weak만 존재) 컨트롤로는 끄고 ColorVariants 스토리에서 유효한 조합만 보여준다
    color: { control: false },
    variant: { control: false },
  },
  args: {
    children: "버튼",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ColorVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button color="neutral" variant="fill">
          neutral fill
        </Button>
        <Button color="neutral" variant="weak">
          neutral weak
        </Button>
        <Button color="neutral" variant="ghost">
          neutral ghost
        </Button>
        <Button color="neutral" variant="stroke">
          neutral stroke
        </Button>
      </div>
      <div className="flex gap-2">
        <Button color="brand" variant="fill">
          brand fill
        </Button>
        <Button color="brand" variant="weak">
          brand weak
        </Button>
      </div>
      <div className="flex gap-2">
        <Button color="danger" variant="fill">
          danger fill
        </Button>
        <Button color="danger" variant="weak">
          danger weak
        </Button>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button size="small">small</Button>
      <Button size="medium">medium</Button>
      <Button size="large">large</Button>
      <Button size="xlarge">xlarge</Button>
    </div>
  ),
};

export const Loading: Story = {
  args: {
    states: "loading",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithIcons: Story = {
  args: {
    leftIcon: <PlaceholderIcon />,
    rightIcon: <PlaceholderIcon />,
  },
};
