import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useRecoilValue } from "recoil";
import EditEstimateItems from "./Edit/EditEstimateItems";
import EditCustomer from "./Edit/EditCustomer";
import { viewEstimateAtom } from "@/store/estimates";

const EditEstimate = () => {
  const viewEstimate = useRecoilValue(viewEstimateAtom);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"} className="w-full">
          <Pencil />
          &nbsp;&nbsp;Edit Estimate
        </Button>
      </DialogTrigger>
      <DialogContent size="md" className="flex flex-col gap-1">
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <EditEstimateDialogButton text="Edit Estimate Items">
          <EditEstimateItems />
        </EditEstimateDialogButton>
        {viewEstimate?.customer && (
          <EditEstimateDialogButton text="Add Customer">
            <EditCustomer />
          </EditEstimateDialogButton>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditEstimate;

const EditEstimateDialogButton = ({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) => {
  const [open, setOpen] = React.useState(false);

  const closeDialog = () => {
    setOpen(false);
  };

  const clonedChildren = React.Children.map(children, (child) =>
    React.isValidElement<{ closeDialog: () => void }>(child)
      ? React.cloneElement(child, { closeDialog })
      : child
  );

  return (
    <Dialog key={text} open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          className=" border-x-0 border-t-0 text-xl font-sofiapro m-0 p-0"
        >
          {text}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {clonedChildren}
      </DialogContent>
    </Dialog>
  );
};
