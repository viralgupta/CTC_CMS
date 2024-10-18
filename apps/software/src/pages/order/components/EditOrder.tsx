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
import { viewOrderAtom } from "@/store/order";
import SettleBalance from "./Edit/SettleBalance";
import EditOrderItems from "./Edit/EditOrderItems";
import EditNote from "./Edit/EditNote";
import AddCustomer from "./Edit/AddCustomer";
import EditCarpenter from "./Edit/EditCarpenter";
import EditArchitect from "./Edit/EditArchitect";
import EditDriver from "./Edit/EditDriver";
import EditPriority from "./Edit/EditPriority";
import EditDeliveryStatus from "./Edit/EditDeliveryStatus";
import EditDeliveryAddress from "./Edit/EditDeliveryAddress";
import EditLabourAndFrate from "./Edit/EditLabourAndFrate";
import EditDiscount from "./Edit/EditDiscount";
import EditDeliveryDate from "./Edit/EditDeliveryDate";

const EditOrder = () => {
  const viewOrder = useRecoilValue(viewOrderAtom);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"}>
          <Pencil />
          &nbsp;&nbsp;Edit Order
        </Button>
      </DialogTrigger>
      <DialogContent size="md" className="flex flex-col gap-1">
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <EditOrderDialogButton text="Settle Balance">
          <SettleBalance />
        </EditOrderDialogButton>
        <EditOrderDialogButton text="Edit Order Items">
          <EditOrderItems />
        </EditOrderDialogButton>
        <EditOrderDialogButton text="Edit Note">
          <EditNote />
        </EditOrderDialogButton>
        {!viewOrder?.customer_id && (
          <EditOrderDialogButton text="Add Customer">
            <AddCustomer />
          </EditOrderDialogButton>
        )}
        <EditOrderDialogButton text="Edit Carpenter">
          <EditCarpenter />
        </EditOrderDialogButton>
        <EditOrderDialogButton text="Edit Architect">
          <EditArchitect />
        </EditOrderDialogButton>
        <EditOrderDialogButton text="Edit Driver">
          <EditDriver />
        </EditOrderDialogButton>
        <EditOrderDialogButton text="Edit Priority">
          <EditPriority />
        </EditOrderDialogButton>
        <EditOrderDialogButton text="Edit Delivery Status">
          <EditDeliveryStatus />
        </EditOrderDialogButton>
        <EditOrderDialogButton text="Edit Delivery Date">
          <EditDeliveryDate />
        </EditOrderDialogButton>
        <EditOrderDialogButton text="Edit Delivery Address">
          <EditDeliveryAddress />
        </EditOrderDialogButton>
        <EditOrderDialogButton text="Edit Labour & Frate Cost">
          <EditLabourAndFrate />
        </EditOrderDialogButton>
        <EditOrderDialogButton text="Edit Discount">
          <EditDiscount />
        </EditOrderDialogButton>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrder;

const EditOrderDialogButton = ({
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
