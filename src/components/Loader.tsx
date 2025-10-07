import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { Loader2Icon } from "lucide-react";

interface Props {
  className?: ClassValue;
}

const Loader = ({ className }: Props) => {
  return <Loader2Icon className={cn("animate-spin", className)} />;
};

export default Loader;
