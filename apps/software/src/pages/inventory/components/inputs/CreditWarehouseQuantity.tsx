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

type WarehouseCreditItemQuantityProps = {
  totalQuantity: number;
  currentQuantity: {
    id: string;
    quantity: number;
    warehouse: {
      name: string;
    };
  }[];
  onChange: (
    quantity:
      | {
          warehouse_quantity_id: string;
          quantity: number;
        }[]
      | undefined
  ) => void;
  disabled: boolean;
};

const CreditWarehouseQuantity = ({
  totalQuantity,
  currentQuantity,
  onChange,
  disabled,
}: WarehouseCreditItemQuantityProps) => {
  const [open, setOpen] = React.useState(false);
  const [remainingQuantity, setRemainingQuantity] =
    React.useState(totalQuantity);
  const [warehouseQuantity, setWarehouseQuantity] = React.useState<
    {
      name: string;
      warehouse_quantity_id: string;
      current_quantity: number;
      quantity: number;
    }[]
  >(
    currentQuantity.map((c) => {
      return {
        name: c.warehouse.name,
        warehouse_quantity_id: c.id,
        current_quantity: c.quantity,
        quantity: 0,
      };
    })
  );

  React.useEffect(() => {
    setRemainingQuantity(
      totalQuantity -
        warehouseQuantity.reduce((acc, wq) => acc + wq.quantity, 0)
    );
    onChange(
      warehouseQuantity
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
      }}
    >
      <DialogTrigger className="w-full" asChild>
        <Button
          variant={"outline"}
          type="button"
          disabled={disabled}
          className="text-end"
        >
          {warehouseQuantity.reduce((acc, wq) => acc + wq.quantity, 0) !== totalQuantity || disabled ? "Select Warehouse Quantities" : warehouseQuantity.reduce((acc, wq) => acc.concat(wq.quantity > 0 ? `${wq.name}: ${wq.quantity} ` : ''), '')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {warehouseQuantity.length == 0 ? (
          <Skeleton className="w-full h-44" />
        ) : (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Warehouse</TableHead>
                  <TableHead className="text-center">
                    Current Quantity
                  </TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouseQuantity.map((wq) => (
                  <TableRow key={wq.warehouse_quantity_id}>
                    <TableCell className="text-center">{wq.name}</TableCell>
                    <TableCell className="text-center text-lg">{wq.current_quantity}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={wq.quantity}
                        onChange={(e) =>
                          setWarehouseQuantity((wqf) => [
                            ...wqf.map((wqf) =>
                              wqf.warehouse_quantity_id ===
                              wq.warehouse_quantity_id
                                ? { ...wqf, quantity: Number(e.target.value ?? 0) }
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
              Remaining Quantity: <span className={warehouseQuantity.reduce((acc, wq) => acc + wq.quantity, 0) !== totalQuantity ? "text-red-500" : ""}>{remainingQuantity}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreditWarehouseQuantity;
