import { create } from "zustand";

type ErrorDialogState = {
  message: string | null;
  onClose: (() => void) | null;
  openErrorDialog: (message: string, onClose?: () => void) => void;
  closeErrorDialog: () => void;
};

export const useErrorDialogStore = create<ErrorDialogState>((set, get) => ({
  message: null,
  onClose: null,
  openErrorDialog: (message, onClose) => set({ message, onClose: onClose ?? null }),
  closeErrorDialog: () => {
    const { onClose } = get();
    set({ message: null, onClose: null });
    onClose?.();
  },
}));
