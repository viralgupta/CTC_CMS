import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import React from "react";
import { z } from "zod";
import { toast } from "sonner";
import AddNewItem from "./AddNewItem";
import SelectedItemTable from "./SelectedItemTable";
import { createEstimateType } from "@type/api/estimate";

const SelectEstimateItems = ({
  value,
  onChange,
}: {
  value: z.infer<typeof createEstimateType>["estimate_items"];
  onChange: (
    values: z.infer<typeof createEstimateType>["estimate_items"]
  ) => void;
}) => {
  const [estimateItems, setEstimateItems] = React.useState<
    z.infer<typeof createEstimateType>["estimate_items"]
  >(value ?? []);

  React.useEffect(() => {
    onChange(estimateItems);
  }, [estimateItems]);

  const removeItem = (item_id: number) => {
    setEstimateItems((ei) => ei.filter((i) => i.item_id !== item_id));
  };

  const editItem = (
    value: z.infer<typeof createEstimateType>["estimate_items"][number]
  ) => {
    setEstimateItems((ei) => {
      const otherItems = ei.filter((i) => i.item_id !== value.item_id);
      return [...otherItems, value];
    });
  };

  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <Input
          className="w-full h-12"
          placeholder={
            value && value.length > 0
              ? `${value.length} items selected...`
              : "Select Estimate Items..."
          }
        />
      </DialogTrigger>
      <DialogContent size="6xl">
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <AddNewItem
          onSubmit={(v) => {
            setEstimateItems((ei) => {
              const sameItem = ei.filter((i) => i.item_id === v.item_id);
              if (sameItem.length > 0) {
                toast.error("Same Item Already Exists!!!", {
                  description: "Please edit the existing item.",
                });
                return ei;
              } else {
                return [...ei, v];
              }
            });
          }}
        />
        <SelectedItemTable
          items={estimateItems}
          removeItem={removeItem}
          editItem={editItem}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SelectEstimateItems;
