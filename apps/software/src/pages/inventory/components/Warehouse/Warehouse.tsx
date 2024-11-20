import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AllWarehouseTable from "./AllWarehouseTable";
import CreateWarehouseForm from "./CreateWarehouse";
import { WarehouseIcon } from "lucide-react";

const Warehouse = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          className="border border-border rounded-md flex items-center justify-center text-2xl font-sofiapro cursor-pointer hover:border-accent-foreground duration-200 w-full mt-4 gap-2 flex-none"
        >
          View All Warehouse <WarehouseIcon/>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant={"outline"} className="border border-border rounded-md flex items-center justify-center text-2xl font-sofiapro cursor-pointer hover:border-accent-foreground duration-200 w-full">
              Create New Warehouse +
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader className="hidden">
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <CreateWarehouseForm />
          </DialogContent>
        </Dialog>
        <AllWarehouseTable/>
      </DialogContent>
    </Dialog>
  );
};

export default Warehouse;
