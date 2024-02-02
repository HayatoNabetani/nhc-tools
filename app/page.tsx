import ToolCard from "@/features/Tool/ToolCard/ToolCard";
import { ToolList } from "./constants/Tools";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center px-24">
      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        {ToolList.map((t) => (
          <ToolCard key={t.id} {...t} />
        ))}
      </div>
    </main>
  );
}
