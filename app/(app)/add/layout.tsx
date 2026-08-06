import { AddFlowProvider } from "@/lib/context/AddFlowContext";

export default function AddLayout({ children }: { children: React.ReactNode }) {
  return <AddFlowProvider>{children}</AddFlowProvider>;
}
