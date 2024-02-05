import { HiClipboardCopy } from "react-icons/hi";
import { MdAttachFile } from "react-icons/md";

export const ICONS: any = {
  file: {
    functions: () => {
      console.log("a");
    },
    components: <MdAttachFile />,
  },
  copy: {
    functions: (value: string) => {
      if (!value) return;
      navigator.clipboard.writeText(value);
    },
    components: <HiClipboardCopy width={15} height={15} />,
  },
};
