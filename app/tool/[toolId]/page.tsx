"use client";
import { ToolList } from "@/constants/Tools";
import { useParams } from "next/navigation";
import { Suspense } from "react";

const ToolPage = () => {
  const params = useParams();
  const { toolId } = params;
  const tool = ToolList.find((t) => t.id === parseInt(toolId as string));
  return (
    <main className="flex min-h-screen flex-col items-center lg:max-w-5xl mx-auto">
      {tool ? (
        <Suspense fallback={<div>Loading...</div>}>
          <tool.Component />
        </Suspense>
      ) : (
        <div>Tool not found.</div>
      )}
    </main>
  );
};

export default ToolPage;
