import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RotateCcw } from "lucide-react";

const RefetchButton = ({
  description,
  refetchFunction,
  className = "",
}: {
  description: string;
  refetchFunction: () => void;
  className?: string;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className={className} onClick={refetchFunction}>
          <RefetchIcon/>
        </TooltipTrigger>
        <TooltipContent className="font-sofiapro">{description}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const RefetchIcon = () => {
  return (
    <RotateCcw className="w-full h-full inline p-0 m-0 stoke-foreground"/>
  );
};

export default RefetchButton;
