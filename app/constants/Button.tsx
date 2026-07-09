import { HiClipboardCopy } from "react-icons/hi";
import { MdAttachFile } from "react-icons/md";

interface IconDef {
  onClick: (value?: string) => void;
  icon: JSX.Element;
}

export const ICONS = {
  file: {
    onClick: () => {},
    icon: <MdAttachFile />,
  },
  copy: {
    onClick: (value?: string) => {
      if (!value) return;
      navigator.clipboard.writeText(value);
    },
    icon: <HiClipboardCopy width={15} height={15} />,
  },
} satisfies Record<string, IconDef>;

export type IconType = keyof typeof ICONS;
