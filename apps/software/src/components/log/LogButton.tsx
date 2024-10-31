import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { viewLogButtonAtom, viewLogButtonType } from "@/store/log";
import { Scroll } from "lucide-react";
import { Button } from "../ui/button";
import { useSetRecoilState } from "recoil";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const LogButton = ({ value, className }: { value: viewLogButtonType, className?: string }) => {
  const setViewLogButton = useSetRecoilState(viewLogButtonAtom);
  const { data, status } = useSession()
  // @ts-ignore
  if(status == "loading" || status == "unauthenticated" || !data?.user?.isAdmin!) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={() => {setViewLogButton(value)}} variant={"outline"} className={cn("p-1 border-0 translate-y-0.5", className)}>
            <Scroll className="w-full h-full" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>View Logs</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default LogButton;
