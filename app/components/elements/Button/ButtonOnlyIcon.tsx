import { HiClipboardCopy } from "react-icons/hi";
import { MdAttachFile } from "react-icons/md";

interface Props {
  type: string;
  value?: string;
}

const ButtonOnlyIcon = ({ type, value }: Props) => {
  const icons: any = {
    file: {
      functions: () => {
        console.log("a");
      },
      components: <MdAttachFile />,
    },
    copy: {
      functions: () => {
        if (!value) return;
        navigator.clipboard.writeText(value);
      },
      components: <HiClipboardCopy width={15} height={15} />,
    },
  };

  return (
    <button
      type="button"
      className="inline-flex justify-center items-center p-1 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100"
      onClick={icons[type].functions}
    >
      {icons[type].components}
      <span className="sr-only">{type}</span>
    </button>
  );
};

export default ButtonOnlyIcon;