interface Props {
  text: string;
  handleClick: () => void;
}

const Button = ({ text, handleClick }: Props) => {
  return (
    <button
      type="button"
      className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 hover:bg-blue-800"
      onClick={handleClick}
    >
      {text}
    </button>
  );
};

export default Button;
