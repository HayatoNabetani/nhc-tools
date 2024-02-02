import RightArrow from "@/app/components/elements/Arrow/RightArrow";
import Link from "next/link";

interface Props {
  id: number;
  title: string;
  content: string;
}

const ToolCard = ({ id, title, content }: Props) => {
  return (
    <Link
      href={`/tool/${id}`}
      className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100"
    >
      <h2 className={`mb-3 text-xl font-semibold`}>
        {title}
        <RightArrow />
      </h2>
      <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>{content}</p>
    </Link>
  );
};

export default ToolCard;
