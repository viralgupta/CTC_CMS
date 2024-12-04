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
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useSetRecoilState } from "recoil";
import { viewItemIDAtom } from "@/store/Items";
import request from "@/lib/request";
import { useAllWarehouse } from "@/hooks/warehouse";
import { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/DataTable";

const ViewWarehouse = ({
  warehouse_id,
  children,
}: {
  warehouse_id: number;
  children: React.ReactNode;
}) => {
  type WarehouseQuantities = {
    item_id: number;
    quantity: number;
    item: {
      name: string;
    };
  };

  const [open, setOpen] = React.useState(false);
  const [warehouse, setWarehouse] = React.useState<null | {
    name: string;
    id: number;
    warehouse_quantities: WarehouseQuantities[];
  }>(null);
  const setViewItemId = useSetRecoilState(viewItemIDAtom);
  const { refetchWarehouses } = useAllWarehouse();
  const [deleteLoading, setDeleteLoading] = React.useState(false);

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


  const columns: ColumnDef<WarehouseQuantities>[] = [
    {
      id: "item_name",
      accessorKey: "item.name",
      header: "Item Name",
    },
    {
      id: "quantity",
      accessorKey: "quantity",
      header: "Quantity",
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const itemId = row.original.item_id;
        return (
          <Button size={"icon"} onClick={() => setViewItemId(itemId)}>
            <Eye />
          </Button>
        );
      },
    },
  ];

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
          <div className="max-h-96 overflow-y-auto hide-scroll flex flex-col">
            <DataTable
              data={warehouse.warehouse_quantities}
              key={"Warehouse Items"}
              columns={columns}
              columnFilters={false}
              defaultColumn={{
                meta: {
                  headerStyle: {
                    textAlign: "center",
                  },
                },
              }}
              message="No Items Found In This Warehouse!"
            />
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};

export default ViewWarehouse;
