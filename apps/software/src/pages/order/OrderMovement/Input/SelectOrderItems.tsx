import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { viewOrderAtom } from "@/store/order";
import { createOrderMovementType } from "@type/api/order";
import React from "react";
import { useRecoilValue } from "recoil";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const SelectOrderItems = ({
  onChange,
  value,
}: {
  onChange: (
    value: z.infer<typeof createOrderMovementType>["order_movement_items"]
  ) => void;
  value: z.infer<typeof createOrderMovementType>["order_movement_items"];
}) => {
  const [orderMovementItems, setOrderMovementItems] = React.useState<
    z.infer<typeof createOrderMovementType>["order_movement_items"]
  >([]);
  const [open, setOpen] = React.useState(false);
  const viewOrder = useRecoilValue(viewOrderAtom);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full pb-2">
        <Input
          className="w-full"
          placeholder={
            (value ?? []).length > 0
              ? `${(value ?? []).length} Order Item Selected...`
              : "Select Order Items..."
          }
        />
      </DialogTrigger>
      <DialogContent size="2xl">
        <DialogHeader>
          <DialogTitle>Select Order Items</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Item Name</TableHead>
              <TableHead className="text-center">Total Quantity</TableHead>
              <TableHead className="text-center">Delivered Quantity</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {viewOrder?.order_items?.map((orderItem) => {
              return (
                <TableRow key={orderItem.item_id}>
                  <TableCell className="text-center py-2">{orderItem.item?.name}</TableCell>
                  <TableCell className="text-center py-2">{orderItem.quantity}</TableCell>
                  <TableCell className="text-center py-2">{orderItem.delivered_quantity}</TableCell>
                  <TableCell className="text-center py-2">
                    <Input
                      type="number"
                      defaultValue={((value ?? []).filter((oi) => oi.order_item_id == orderItem.id)[0]?.quantity ?? 0)}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) ?? 0;
                        if (value > 0) {
                          setOrderMovementItems([
                            ...orderMovementItems,
                            {
                              order_item_id: orderItem.id,
                              quantity: value,
                            },
                          ]);
                        } else {
                          setOrderMovementItems(
                            orderMovementItems.filter(
                              (item) => item.order_item_id !== orderItem.id
                            )
                          );
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <Button
          onClick={() => {
            onChange(orderMovementItems);
            setOpen(false);
          }}
        >
          Submit
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SelectOrderItems;
