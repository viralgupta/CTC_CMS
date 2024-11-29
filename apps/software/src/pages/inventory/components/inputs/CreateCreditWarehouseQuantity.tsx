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
import { useAllWarehouse } from "@/hooks/warehouse";

type WarehouseCreditItemQuantityProps = {
  totalQuantity: number;
  onChange: (
    quantity:
      | {
          warehouse_id: number;
          quantity: number;
        }[]
      | undefined
  ) => void;
  disabled: boolean;
};

const CreateCreditWarehouseQuantity: React.FC<
  WarehouseCreditItemQuantityProps
> = ({ totalQuantity, onChange, disabled }) => {
  const [open, setOpen] = React.useState(false);
  const [remainingQuantity, setRemainingQuantity] =
    React.useState(totalQuantity);
  const [warehouseQuantity, setWarehouseQuantity] = React.useState<
    | {
        warehouse_id: number;
        name: string;
        quantity: number;
      }[]
    | null
  >(null);
  const { warehouse, loading } = useAllWarehouse();

  React.useEffect(() => {
    if (warehouseQuantity) {
      setRemainingQuantity(
        totalQuantity -
          warehouseQuantity.reduce((acc, wq) => acc + wq.quantity, 0)
      );
      onChange(
        warehouseQuantity
          .filter((wq) => wq.quantity > 0)
          .map((wq) => {
            return {
              warehouse_id: wq.warehouse_id,
              quantity: wq.quantity,
            };
          })
      );
    }
  }, [warehouseQuantity]);

  React.useEffect(() => {
    setWarehouseQuantity(
      warehouse?.map((w) => {
        return {
          warehouse_id: w.id,
          name: w.name,
          quantity: 0,
        };
      })
    )
  }, [warehouse]);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          setRemainingQuantity(totalQuantity - (warehouseQuantity ?? []).reduce((acc, wq) => acc + wq.quantity, 0));
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
          warehouseQuantity.reduce((acc, wq) => acc + wq.quantity, 0) !==
            totalQuantity ||
          disabled
            ? "Select Warehouse Quantities"
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
        {!warehouseQuantity || loading ? (
          <Skeleton className="w-full h-44" />
        ) : (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Warehouse</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouseQuantity.map((wq) => (
                  <TableRow key={wq.name}>
                    <TableCell className="text-center">{wq.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={wq.quantity}
                        onChange={(e) =>
                          setWarehouseQuantity((wqf) => [
                            ...(wqf ?? []).map((wqf) =>
                              wqf.warehouse_id === wq.warehouse_id
                                ? {
                                    ...wqf,
                                    quantity: Number(e.target.value ?? 0),
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
              Remaining Quantity:{" "}
              <span
                className={
                  warehouseQuantity.reduce(
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

export default CreateCreditWarehouseQuantity;
