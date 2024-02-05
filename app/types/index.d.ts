interface ToolSet {
  id: number;
  title: string;
  content: string;
}

interface ToolSetWithComponent extends ToolSet {
  Component: React.ComponentType;
}