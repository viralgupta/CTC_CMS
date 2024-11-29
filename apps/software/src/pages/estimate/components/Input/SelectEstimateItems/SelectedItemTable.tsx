import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useAllItems } from "@/hooks/items";
import { Pencil, Trash2 } from "lucide-react";
import AddNewItem from "./AddNewItem";
import { createEstimateType } from "@type/api/estimate";

const SelectedItemTable = ({
  items,
  removeItem,
  editItem,
}: {
  items: z.infer<typeof createEstimateType>["estimate_items"];
  removeItem: (item_id: number) => void;
  editItem: (
    value: z.infer<typeof createEstimateType>["estimate_items"][number]
  ) => void;
}) => {
  const { items: foundItems } = useAllItems();
  return (
    <div>
      <span className="text-2xl font-cubano">Added Items</span>
      <Table>
        <TableCaption>A list of added items.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Item Name</TableHead>
            <TableHead className="text-center">Quantity</TableHead>
            <TableHead className="text-center">Rate</TableHead>
            <TableHead className="text-center">Total Value</TableHead>
            <TableHead className="text-center">Edit Item</TableHead>
            <TableHead className="text-center">Remove Item</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const foundItem = foundItems.find((i) => i.id === item.item_id);

            return (
              <TableRow key={item.item_id}>
                <TableCell className="text-center">
                  {foundItem?.name ?? ""}
                </TableCell>
                <TableCell className="text-center">{`${item.quantity} ${foundItem?.rate_dimension ?? ""}`}</TableCell>
                <TableCell className="text-center">{`${item.rate} Per ${foundItem?.rate_dimension ?? ""}`}</TableCell>
                <TableCell className="text-center">
                  {item.total_value}
                </TableCell>
                <TableCell className="text-center">
                  <AddNewItem onSubmit={editItem} value={item}>
                    <Button size={"icon"}>
                      <Pencil />
                    </Button>
                  </AddNewItem>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    size={"icon"}
                    onClick={() => removeItem(item.item_id)}
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};


export default SelectedItemTable;