import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Spinner from "@/components/ui/Spinner";
import { editWarehouseType } from "@type/api/item";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useSetRecoilState } from "recoil";
import { viewItemIDAtom } from "@/store/Items";
import request from "@/lib/request";
import { useAllWarehouse } from "@/hooks/warehouse";
import { Skeleton } from "@/components/ui/skeleton";
import { useVirtualizer } from "@tanstack/react-virtual";

const ViewWarehouse = ({
  warehouse_id,
  children,
}: {
  warehouse_id: string;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = React.useState(false);
  const [warehouse, setWarehouse] = React.useState<null | {
    name: string;
    id: string;
    warehouse_quantities: {
      item_id: string;
      quantity: number;
      item: {
        name: string;
      };
    }[];
  }>(null);
  const setViewItemId = useSetRecoilState(viewItemIDAtom);
  const { refetchWarehouses } = useAllWarehouse();
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: (warehouse?.warehouse_quantities ?? []).length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 34,
    overscan: 2,
  });

  const deleteWarehouse = async () => {
    setDeleteLoading(true);
    const res = await request.delete("/inventory/deleteWarehouse", {
      data: { warehouse_id: warehouse?.id ?? "" },
    });
    if (res.status == 200) {
      setOpen(false);
      refetchWarehouses();
    }
    setDeleteLoading(false);
  };

  const EditWarehouseElement = () => {
    const form = useForm<z.infer<typeof editWarehouseType>>({
      resolver: zodResolver(editWarehouseType),
      reValidateMode: "onChange",
      defaultValues: {
        warehouse_id: warehouse?.id,
        name: warehouse?.name,
      },
    });

    async function onSubmit(values: z.infer<typeof editWarehouseType>) {
      try {
        const res = await request.put("/inventory/editWarehouse", values);
        if (res.status == 200) {
          form.reset();
          setOpen(false);
          refetchWarehouses();
        }
      } catch (error) {
        console.log(error);
      }
    }

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant={"outline"} className="w-full flex gap-2">
            Edit Name
            <Pencil />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex w-full flex-col justify-between gap-2 md:flex-row">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Warehouse Name</FormLabel>
                      <FormControl>
                        <Input
                          onChange={(e) => field.onChange(e.target.value ?? "")}
                          value={field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button disabled={form.formState.isSubmitting} type="submit">
                {form.formState.isSubmitting && <Spinner />}
                {!form.formState.isSubmitting && "Submit"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o && !warehouse) {
          request
            .get("inventory/getWarehouse?warehouse_id=" + warehouse_id)
            .then((res) => {
              setWarehouse(res.data.data);
            });
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      {warehouse && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Items in {warehouse.name}</DialogTitle>
            <DialogDescription className="hidden"></DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <EditWarehouseElement />
            <Button
              disabled={deleteLoading}
              variant={"outline"}
              className="w-full"
              onClick={deleteWarehouse}
            >
              {deleteLoading ? (
                <Spinner />
              ) : (
                <div className="flex gap-2">
                  Delete
                  <Trash2 />
                </div>
              )}
            </Button>
          </div>
          <div className="max-h-96 overflow-y-auto hide-scroll" ref={parentRef}>
            <Table style={{ height: `${virtualizer.getTotalSize()}px` }}>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Item Name</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-center w-[100px]">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {virtualizer.getVirtualItems().map((virtualRow, index) => {
                  const wq = warehouse.warehouse_quantities[virtualRow.index];
                  return (
                    <TableRow
                      key={wq.item_id}
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start - index * virtualRow.size}px)`,
                      }}
                    >
                      <TableCell className="text-center py-1">
                        {wq.item.name}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        {wq.quantity}
                      </TableCell>
                      <TableCell className="text-center py-1">
                        <Button
                          size={"icon"}
                          onClick={() => setViewItemId(wq.item_id)}
                        >
                          <Eye />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default ViewWarehouse;
