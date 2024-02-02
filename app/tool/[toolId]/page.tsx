"use client";

import { useParams } from "next/navigation";

const ToolPage = () => {
  const params = useParams();
  const { toolId } = params;
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      Enter {toolId}
    </main>
  );
};

export default ToolPage;
