import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import BankSelectBox from "@/components/BankSelectBox";
import KakaoBankLogo from "@/assets/images/banks/KAKAO_BANK.svg?react";

const Logo = () => <KakaoBankLogo className="size-6" />;

const meta = {
  title: "Components/BankSelectBox",
  component: BankSelectBox,
  parameters: {
    layout: "centered",
  },
  decorators: [
    Story => (
      <div className="w-[101px]">
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    selected: { control: "boolean" },
    text: { control: "text" },
    image: { control: false },
  },
  args: {
    selected: false,
    text: "카카오뱅크",
    image: <Logo />,
  },
} satisfies Meta<typeof BankSelectBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: {
    selected: true,
  },
};

function ToggleBankSelectBox(args: Story["args"]) {
  const [selected, setSelected] = useState(false);

  return (
    <BankSelectBox
      {...args}
      text={args?.text ?? "카카오뱅크"}
      image={args?.image ?? <Logo />}
      selected={selected}
      onClick={() => setSelected(prev => !prev)}
    />
  );
}

export const Toggle: Story = {
  argTypes: {
    selected: { control: false },
  },
  render: args => <ToggleBankSelectBox {...args} />,
};
