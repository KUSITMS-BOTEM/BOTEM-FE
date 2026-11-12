import { create } from "zustand";

type ErrorDialogState = {
  message: string | null;
  openErrorDialog: (message: string) => void;
  closeErrorDialog: () => void;
};

export const useErrorDialogStore = create<ErrorDialogState>(set => ({
  message: null,
  openErrorDialog: message => set({ message }),
  closeErrorDialog: () => set({ message: null }),
}));
