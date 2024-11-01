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
import { calculateCommissionFromTotalCommission } from "@/lib/utils";
import { createOrderType } from "@type/api/order";
import AddNewItem from "./AddNewItem";

const SelectedItemTable = ({
  items,
  removeItem,
  editItem,
}: {
  items: z.infer<typeof createOrderType>["order_items"];
  removeItem: (item_id: string) => void;
  editItem: (
    value: z.infer<typeof createOrderType>["order_items"][number]
  ) => void;
}) => {
  const { items: allItems } = useAllItems();
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
            <TableHead className="text-center">Architect Commission</TableHead>
            <TableHead className="text-center">Carpanter Commission</TableHead>
            <TableHead className="text-center">Edit Item</TableHead>
            <TableHead className="text-center">Remove Item</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const foundItem = allItems.find((i) => i.id === item.item_id);

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
                  {`₹${item.architect_commision} ${calculateCommissionFromTotalCommission(item.architect_commision, item.architect_commision_type, item.total_value, item.quantity).bracket}`}
                </TableCell>
                <TableCell className="text-center">
                  {`₹${item.carpanter_commision} ${calculateCommissionFromTotalCommission(item.carpanter_commision, item.carpanter_commision_type, item.total_value, item.quantity).bracket}`}
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