import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Button from "@/components/Button";

const PlusIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" className="size-full">
    <path
      d="M9.16667 16.6667V10.8333H3.33333C2.8731 10.8333 2.5 10.4602 2.5 10C2.5 9.53976 2.8731 9.16667 3.33333 9.16667H9.16667V3.33333C9.16667 2.8731 9.53976 2.5 10 2.5C10.4602 2.5 10.8333 2.8731 10.8333 3.33333V9.16667H16.6667C17.1269 9.16667 17.5 9.53976 17.5 10C17.5 10.4602 17.1269 10.8333 16.6667 10.8333H10.8333V16.6667C10.8333 17.1269 10.4602 17.5 10 17.5C9.53976 17.5 9.16667 17.1269 9.16667 16.6667Z"
      fill="#FFFFFF"
    />
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
  render: () => (
    <div className="flex gap-2">
      <Button states="loading">neutral</Button>
      <Button color="brand" states="loading">
        brand
      </Button>
      <Button color="danger" states="loading">
        danger
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithIcons: Story = {
  args: {
    leftIcon: <PlusIcon />,
    rightIcon: <PlusIcon />,
  },
};
