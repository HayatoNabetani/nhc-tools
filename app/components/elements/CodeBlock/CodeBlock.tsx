import ButtonOnlyIcon from "../Button/ButtonOnlyIcon";

interface Props {
  codeString: string;
}

const CodeBlock = ({ codeString }: Props) => {
  return (
    <div className="flex items-center justify-between text-gray-800 border border-gray-800 bg-white max-w-sm font-mono text-sm py-3 px-4 rounded-md">
      <div className="flex gap-1">
        <span>{codeString}</span>
      </div>
      <span className="flex text-gray-800 cursor-pointer w-5 h-5 hover:text-gray-400 duration-200">
        <ButtonOnlyIcon type="copy" value={codeString} />
      </span>
    </div>
  );
};

export default CodeBlock;
