import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createOrderType } from "@type/api/order";
import React from "react";
import { z } from "zod";
import { toast } from "sonner";
import AddNewItem from "./AddNewItem";
import SelectedItemTable from "./SelectedItemTable";

const SelectOrderItems = ({
  value,
  onChange,
  delivered,
  carpenter_id,
  architect_id
}: {
  value: z.infer<typeof createOrderType>["order_items"];
  onChange: (values: z.infer<typeof createOrderType>["order_items"]) => void;
  delivered: boolean;
  carpenter_id?: number;
  architect_id?: number;
}) => {
  const [orderItems, setOrderItems] = React.useState<
    z.infer<typeof createOrderType>["order_items"]
  >(value ?? []);

  React.useEffect(() => {
    onChange(
      orderItems.map((oi) => {
        return {
          ...oi,
          architect_commision: oi.architect_commision
            ? oi.architect_commision.toString()
            : "0.00",
          carpenter_commision: oi.carpenter_commision
            ? oi.carpenter_commision.toString()
            : "0.00",
          total_value: oi.total_value ? oi.total_value.toString() : "0.00",
        };
      })
    );
  }, [orderItems]);

  const removeItem = (item_id: number) => {
    setOrderItems((oi) => oi.filter((i) => i.item_id !== item_id));
  };

  const editItem = (
    value: z.infer<typeof createOrderType>["order_items"][number]
  ) => {
    setOrderItems((oi) => {
      const otherItems = oi.filter((i) => i.item_id !== value.item_id);
      return [...otherItems, value];
    });
  };

  return (
    <Dialog onOpenChange={(o) => {
      if(o) {
        setOrderItems(value ?? []);
      }
    }}>
      <DialogTrigger className="w-full">
        <Input
          className="w-full"
          placeholder={
            value && value.length > 0
              ? `${value.length} items selected...`
              : "Select Order Items..."
          }
        />
      </DialogTrigger>
      <DialogContent size={value.length > 0 ? "6xl" : "3xl"}>
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <AddNewItem
          delivered={delivered}
          carpenter_id={carpenter_id}
          architect_id={architect_id}
          onSubmit={(v) => {
            setOrderItems((oi) => {
              const sameItem = oi.filter(i => i.item_id === v.item_id);
              if(sameItem.length > 0){
                toast.error("Same Item Already Exists!!!", {
                  description: "Please edit the existing item."
                })
                return oi;
              } else {
                return [...oi, v]
              }
            });
          }}
        />
        <SelectedItemTable
          delivered={delivered}
          items={orderItems}
          removeItem={removeItem}
          editItem={editItem}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SelectOrderItems;
