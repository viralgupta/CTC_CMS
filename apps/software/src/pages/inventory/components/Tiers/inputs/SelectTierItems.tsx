import DataTable from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useAllItems } from "@/hooks/items";
import { ColumnDef } from "@tanstack/react-table";
import { createTierType } from "@type/api/item";
import React from "react";
import { z } from "zod";
import { setDebouncedValue } from "@/lib/utils";
import { useAllTiers } from "@/hooks/tier";
import { Copy } from "lucide-react";
import request from "@/lib/request";
import { ViewTierType } from "../ViewTier";
import Spinner from "@/components/ui/Spinner";

const SelectedTierItems = ({
  value,
  onChange,
}: {
  value: z.infer<typeof createTierType>["tier_items"];
  onChange: (values: z.infer<typeof createTierType>["tier_items"]) => void;
}) => {
  const [copyLoading, setCopyLoading] = React.useState(false);
  const { items } = useAllItems();
  const { tiers } = useAllTiers();

  const copyTier = async (tier_id: number) => {
    setCopyLoading(true);
    const res = await request.get("inventory/getTier?tier_id=" + tier_id);
    if (res.status === 200) {
      const response: ViewTierType = res.data.data;
      const copiedTierItems = response.tier_items.map((item) => ({
        item_id: item.item_id,
        commision: item.commision,
        commision_type: item.commision_type,
      }));
      onChange(copiedTierItems);
    }
    setCopyLoading(false);
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 items-center">
        <SelectNewItemsDialog item_ids={value} onChange={onChange} />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant={"outline"} className="m-0">
              {copyLoading ? <Spinner /> : "Copy Existing Tier"}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Tier Name</TableHead>
                  <TableHead className="text-center w-[100px]">Copy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiers.map((tier) => (
                  <TableRow key={tier.id}>
                    <TableCell className="text-center py-1">
                      {tier.name}
                    </TableCell>
                    <TableCell className="text-center py-1">
                      <Button
                        size={"icon"}
                        variant={"outline"}
                        className="border-primary"
                        onClick={() => copyTier(tier.id)}
                        disabled={copyLoading}
                      >
                        <Copy className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </PopoverContent>
        </Popover>
      </div>
      <div className="w-full max-h-96 flex flex-col mt-2 overflow-y-auto hide-scroll">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Item Name</TableHead>
              <TableHead className="text-center">Item Rate</TableHead>
              <TableHead className="text-center">Commission</TableHead>
              <TableHead className="text-center">Commission Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {value.map((v) => {
              const foundItem = items.find((item) => item.id === v.item_id);
              return (
                <TableRow key={v.item_id}>
                  <TableCell className="text-center py-1">
                    {foundItem?.name ?? "Item Not Found"}
                  </TableCell>
                  <TableCell className="text-center py-1">{`₹${foundItem?.sale_rate ?? "0.00"} / ${foundItem?.rate_dimension ?? "Unit"}`}</TableCell>
                  <TableCell className="py-1">
                    <Input
                      className="w-32 mx-auto"
                      type="number"
                      value={parseFloat(v.commision)}
                      onChange={(e) => {
                        const newValue = value.map((item) => {
                          if (item.item_id === v.item_id) {
                            return {
                              ...item,
                              commision: isNaN(parseFloat(e.target.value))
                                ? "0.00"
                                : parseFloat(e.target.value).toFixed(2),
                            };
                          }
                          return item;
                        });
                        onChange(newValue);
                      }}
                    />
                  </TableCell>
                  <TableCell className="py-1">
                    <Select
                      value={v.commision_type ?? "perPiece"}
                      onValueChange={(c_type: "percentage" | "perPiece") => {
                        const newValue = value.map((item) => {
                          if (item.item_id === v.item_id) {
                            return { ...item, commision_type: c_type };
                          }
                          return item;
                        });
                        onChange(newValue);
                      }}
                    >
                      <SelectTrigger className="w-32 mx-auto">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">% Percentage</SelectItem>
                        <SelectItem value="perPiece">Per Piece</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SelectedTierItems;

const SelectNewItemsDialog = ({
  item_ids,
  onChange,
}: {
  item_ids: z.infer<typeof createTierType>["tier_items"];
  onChange: (values: z.infer<typeof createTierType>["tier_items"]) => void;
}) => {
  const { items } = useAllItems();
  const [open, setOpen] = React.useState(false);
  const [filterValue, setFilterValue] = React.useState("");
  const [rowSelection, setRowSelection] = React.useState<
    Record<number, boolean>
  >(
    item_ids.reduce<Record<number, boolean>>((acc, item_id) => {
      const index = items.findIndex((item) => item.id === item_id.item_id);
      if (index === -1) return acc;
      acc[index] = true;
      return acc;
    }, {})
  );

  const confirmEdit = () => {
    let selectedItems = Object.keys(rowSelection).map(
      (key) => items[Number(key)].id
    );
    const newItems = [
      selectedItems
        .filter((item) => !item_ids.map((i) => i.item_id).includes(item))
        .map((item_id) => ({
          item_id,
          commision: "0.00",
          commision_type: "percentage" as "percentage" | "perPiece",
        })),
      item_ids.filter((item) => selectedItems.includes(item.item_id)),
    ].flat();
    onChange(newItems);
    setOpen(false);
  };

  const columns: ColumnDef<{ item_name: string }>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex gap-2 items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
          Select All
        </div>
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "item_name",
      accessorKey: "item_name",
      header: "Item Name",
    },
  ];

  return (
    <Dialog
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          setRowSelection({});
        } else {
          setRowSelection(
            item_ids.reduce<Record<number, boolean>>((acc, item_id) => {
              const index = items.findIndex(
                (item) => item.id === item_id.item_id
              );
              if (index === -1) return acc;
              acc[index] = true;
              return acc;
            }, {})
          );
        }
      }}
      open={open}
    >
      <DialogTrigger asChild className="w-full">
        <Button variant={"outline"} className="border-primary">
          Select Tier Items
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Button
          variant={"outline"}
          className="border-primary"
          onClick={confirmEdit}
        >
          Confirm Edit
        </Button>
        <Input
          className="w-full rounded-full"
          placeholder="Search Items..."
          onChange={(event) => {
            setDebouncedValue({
              key: "TieritemFilterValue",
              value: event.target.value ?? "",
              setFunction: setFilterValue,
              delay: 500,
            });
          }}
        />
        <div className="w-full max-h-96 flex flex-col">
          <DataTable
            thin
            data={items.map((item) => ({ item_name: item.name }))}
            key={"Select Tier Items"}
            columns={columns}
            columnFilters={[{ id: "item_name", value: filterValue }]}
            defaultColumn={{
              meta: {
                headerStyle: {
                  textAlign: "center",
                },
              },
            }}
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            message="No Items Found To Select!"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
