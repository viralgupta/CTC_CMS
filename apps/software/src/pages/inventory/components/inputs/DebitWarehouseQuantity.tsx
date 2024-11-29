import { Button } from "@/components/ui/button";
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
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import request from "@/lib/request";
import { Warehouse } from "lucide-react";

type DebitWarehouseQuantityPropsType = {
  totalQuantity: number;
  item_id: number;
  onChange: (
    quantity:
      | {
          warehouse_quantity_id: number;
          quantity: number;
        }[]
      | undefined
  ) => void;
  existingQuantities?: {
    warehouse_quantity_id: number;
    quantity: number;
  }[]
  disabled: boolean;
};

type foundWarehouseQuantity = {
  id: number;
  quantity: number;
  warehouse: {
    name: string;
  };
}[];

const DebitWarehouseQuantity = ({
  totalQuantity,
  item_id,
  onChange,
  disabled,
  existingQuantities
}: DebitWarehouseQuantityPropsType) => {
  const [open, setOpen] = React.useState(false);
  const [remainingQuantity, setRemainingQuantity] = React.useState(totalQuantity);
  const [warehouseQuantity, setWarehouseQuantity] = React.useState<{
      warehouse_quantity_id: number;
      name: string;
      current_quantity: number;
      quantity: number;
    }[]>((existingQuantities ?? []).map((eq) => {
      return {
        warehouse_quantity_id: eq.warehouse_quantity_id,
        name: "__",
        current_quantity: 0,
        quantity: eq.quantity
      }
    }));

  React.useEffect(() => {
    setRemainingQuantity(totalQuantity - (warehouseQuantity ?? []).reduce((acc, wq) => acc + wq.quantity, 0));
    onChange(
      (warehouseQuantity ?? [])
        .filter((wq) => wq.quantity > 0)
        .map((wq) => {
          return {
            warehouse_quantity_id: wq.warehouse_quantity_id,
            quantity: wq.quantity,
          };
        })
    );
  }, [warehouseQuantity]);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          request
            .get("/inventory/getWarehouseItemQuantities?item_id=" + item_id)
            .then((res) => {
              setWarehouseQuantity(
                (res.data.data as foundWarehouseQuantity).map((wq) => {
                  return {
                    warehouse_quantity_id: wq.id,
                    name: wq.warehouse.name,
                    current_quantity: wq.quantity,
                    quantity: (existingQuantities ?? []).find((eq) => eq.warehouse_quantity_id === wq.id)?.quantity ?? 0,
                  };
                })
              );
            });
          
          requestAnimationFrame(() => {
            setRemainingQuantity(totalQuantity - (warehouseQuantity ?? []).reduce((acc, wq) => acc + wq.quantity, 0));
          });
        }
      }}
    >
      <DialogTrigger className="w-full" asChild>
        <Button
          variant={"outline"}
          type="button"
          disabled={disabled}
          className="text-end"
        >
          {!warehouseQuantity ||
          (warehouseQuantity ?? []).reduce(
            (acc, wq) => acc + wq.quantity,
            0
          ) !== totalQuantity ||
          disabled
            ? <Warehouse/>
            : warehouseQuantity.reduce(
                (acc, wq) =>
                  acc.concat(
                    wq.quantity > 0 ? `${wq.name}: ${wq.quantity} ` : ""
                  ),
                ""
              )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {(warehouseQuantity ?? []).length == 0 ? (
          <Skeleton className="w-full h-44" />
        ) : (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Warehouse</TableHead>
                  <TableHead className="text-center">
                    Available Quantity
                  </TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(warehouseQuantity ?? []).map((wq) => (
                  <TableRow key={wq.warehouse_quantity_id}>
                    <TableCell className="text-center">{wq.name}</TableCell>
                    <TableCell className="text-center text-lg">
                      {wq.current_quantity}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={wq.quantity}
                        onChange={(e) =>
                          setWarehouseQuantity((wqf) => [
                            ...(wqf ?? []).map((wqf) =>
                              wqf.warehouse_quantity_id ===
                              wq.warehouse_quantity_id
                                ? {
                                    ...wqf,
                                    quantity:
                                      wqf.current_quantity <
                                      Number(e.target.value ?? 0)
                                        ? wqf.current_quantity
                                        : Number(e.target.value ?? 0),
                                  }
                                : wqf
                            ),
                          ])
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="font-sofiapro text-center text-xl">
              Remaining Quantity:&nbsp;
              <span
                className={
                  (warehouseQuantity ?? []).reduce(
                    (acc, wq) => acc + wq.quantity,
                    0
                  ) !== totalQuantity
                    ? "text-red-500"
                    : ""
                }
              >
                {remainingQuantity}
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DebitWarehouseQuantity;
