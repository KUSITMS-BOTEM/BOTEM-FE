"use client";

import Dialog from "@/components/Dialog";
import { useErrorDialogStore } from "@/store/errorDialogStore";

export default function GlobalErrorDialog() {
  const message = useErrorDialogStore(state => state.message);
  const closeErrorDialog = useErrorDialogStore(state => state.closeErrorDialog);

  return (
    <Dialog
      kind="alert"
      open={message !== null}
      title={message ?? ""}
      confirmLabel="확인"
      onConfirm={closeErrorDialog}
    />
  );
}
