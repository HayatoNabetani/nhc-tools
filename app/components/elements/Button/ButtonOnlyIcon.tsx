import { ICONS } from "@/constants/Button";

interface Props {
  type: string;
  value?: string;
}

const ButtonOnlyIcon = ({ type, value }: Props) => {
  return (
    <button
      type="button"
      className="inline-flex justify-center items-center p-1 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100"
      onClick={() =>
        value ? ICONS[type].functions(value) : ICONS[type].functions()
      }
    >
      {ICONS[type].components}
      <span className="sr-only">{type}</span>
    </button>
  );
};

export default ButtonOnlyIcon;
