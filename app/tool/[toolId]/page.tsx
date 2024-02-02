"use client";

import { useParams } from "next/navigation";

const ToolPage = () => {
  const params = useParams();
  const { toolId } = params;
  return <div>Enter {toolId}</div>;
};

export default ToolPage;
