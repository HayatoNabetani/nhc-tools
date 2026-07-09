import { ICONS, IconType } from "@/constants/Button";

interface Props {
  type: IconType;
  value?: string;
}

const ButtonOnlyIcon = ({ type, value }: Props) => {
  return (
    <button
      type="button"
      className="buttonOnlyIcon inline-flex justify-center items-center p-1 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100"
      onClick={() => ICONS[type].onClick(value)}
    >
      {ICONS[type].icon}
      <span className="sr-only">{type}</span>
    </button>
  );
};

export default ButtonOnlyIcon;
