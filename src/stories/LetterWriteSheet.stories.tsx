import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Button from "@/components/Button";
import LetterWriteSheet from "@/widgets/letter-paper/LetterWriteSheet";

const meta = {
  title: "Widgets/LetterPaper/LetterWriteSheet",
  component: LetterWriteSheet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: { disable: true },
    docs: {
      story: { inline: false, height: "720px" },
      description: {
        component:
          "편지지 작성 시트의 1·2단계(편지 작성 → 툴 추가). 처음 열면 Title이 떴다 사라진 뒤 편지지가 나타난다. `isLoggedIn`이 false면 편지지 우하단 From 자리에서 친구에게 보여질 이름을 바로 입력하고, Enter나 포커스 해제로 확정한 뒤 다시 누르면 고칠 수 있다. 팔레트의 플러스 버튼 위 안내 말풍선은 이름이 채워져 있을 때(로그인)만 보이고, 편지지에 포커스가 가거나 플러스 버튼을 누르면 다시 나타나지 않는다. 플러스 버튼을 누르면 툴 선택 영역이 BottomCTA 위에 겹쳐 열린다.",
      },
    },
  },
} satisfies Meta<typeof LetterWriteSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Button onClick={() => setOpen(true)}>시트 열기</Button>
      <LetterWriteSheet
        open={open}
        onClose={() => setOpen(false)}
        recipientName="지유"
        isLoggedIn={isLoggedIn}
        memberName={isLoggedIn ? "민지" : undefined}
      />
    </>
  );
}

export const LoggedIn: Story = {
  args: { open: true, onClose: () => {}, recipientName: "지유", isLoggedIn: true },
  render: () => <Demo isLoggedIn />,
};

export const Guest: Story = {
  args: { open: true, onClose: () => {}, recipientName: "지유", isLoggedIn: false },
  render: () => <Demo isLoggedIn={false} />,
};
