import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Button from "@/components/Button";
import BotemPopup, { type BotemPopupFriend } from "@/widgets/funding/BotemPopup";

const meta: Meta<typeof BotemPopup> = {
  title: "Widgets/Funding/BotemPopup",
  component: BotemPopup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: { disable: true },
    docs: { story: { inline: false, height: "560px" } },
  },
};

export default meta;
type Story = StoryObj<typeof BotemPopup>;

const FRIENDS: BotemPopupFriend[] = [
  { id: 0, name: "이동현", contributedAt: "2026-10-13T09:30:00" },
  { id: 1, name: "김민영", contributedAt: "2026-10-10T18:20:00" },
  { id: 2, name: "김서진", contributedAt: "2026-10-09T12:00:00" },
  { id: 3, name: "박준희", contributedAt: "2026-10-06T21:45:00" },
];

type DemoProps = Pick<
  React.ComponentProps<typeof BotemPopup>,
  "unconfirmedCount" | "friends" | "isClosed"
>;

function BotemPopupDemo({ unconfirmedCount, friends, isClosed }: DemoProps) {
  const [open, setOpen] = useState(true);
  const close = () => setOpen(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>내 보탬 열기</Button>
      <BotemPopup
        open={open}
        unconfirmedCount={unconfirmedCount}
        friends={friends}
        ownerName="지유"
        isClosed={isClosed}
        onClose={close}
        onUnconfirmedClick={close}
        onEditClick={close}
        onMessageClick={close}
        onContributeClick={close}
      />
    </>
  );
}

export const HasUnconfirmed: Story = {
  render: () => <BotemPopupDemo unconfirmedCount={1} friends={FRIENDS} isClosed={false} />,
};

export const AllConfirmed: Story = {
  render: () => <BotemPopupDemo unconfirmedCount={0} friends={FRIENDS} isClosed={false} />,
};

export const Closed: Story = {
  render: () => <BotemPopupDemo unconfirmedCount={0} friends={FRIENDS} isClosed />,
};

export const NoFriends: Story = {
  render: () => <BotemPopupDemo unconfirmedCount={0} friends={[]} isClosed={false} />,
};
