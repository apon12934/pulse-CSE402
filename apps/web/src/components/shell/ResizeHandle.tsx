import { Separator } from "react-resizable-panels";
import { cn } from "@pulse/ui";

export function ResizeHandle({ className = "", id }: { className?: string; id?: string }) {
  return (
    <Separator
      className={cn(
        "w-1.5 bg-[#1a1a1a] border-x border-[#000000] hover:bg-[#FFFF00] active:bg-[#FFFF00] transition-colors duration-150 delay-75 cursor-col-resize shrink-0 z-50",
        className
      )}
      id={id}
    />
  );
}
