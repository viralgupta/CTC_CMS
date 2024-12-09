import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award } from "lucide-react";
import AllTierTable from "./AllTierTable";
import CreateTier from "./CreateTier";

const Tier = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          className="border border-border rounded-md flex items-center justify-center text-2xl font-sofiapro cursor-pointer hover:border-accent-foreground duration-200 w-full mt-4 gap-2"
        >
          View All Tiers <Award />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <CreateTier>
          <Button
            variant={"outline"}
            className="border border-border rounded-md flex items-center justify-center text-2xl font-sofiapro cursor-pointer hover:border-accent-foreground duration-200 w-full"
          >
            Create New Tier +
          </Button>
        </CreateTier>
        <AllTierTable />
      </DialogContent>
    </Dialog>
  );
};

export default Tier;
