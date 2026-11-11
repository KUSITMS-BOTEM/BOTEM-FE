import OpenSheet, { type OpenSheetProps } from "@/components/OpenSheet";

type CloseSheetProps = Omit<OpenSheetProps, "slideOutOnClose">;

export default function CloseSheet(props: CloseSheetProps) {
  return <OpenSheet {...props} slideOutOnClose />;
}
