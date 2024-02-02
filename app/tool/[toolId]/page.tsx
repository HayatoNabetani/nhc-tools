"use client";

import JsonPrettyLinter from "@/features/JsonPrettyLinter/JsonPrettyLinter";
import JstConverter from "@/features/JstConverter/JstConverter";
import { useParams } from "next/navigation";

const ToolComponentObject: any = {
  "1": <JstConverter />,
  "2": <JsonPrettyLinter />,
};

const ToolPage = () => {
  const params = useParams();
  const { toolId } = params;
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      {ToolComponentObject[toolId as string]}
    </main>
  );
};

export default ToolPage;
