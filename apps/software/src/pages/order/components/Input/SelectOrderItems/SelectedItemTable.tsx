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
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { calculateCommissionFromTotalCommission } from "@/lib/utils";
import { createOrderType } from "@type/api/order";
import AddNewItem from "./AddNewItem";
import { showCommissionAtom } from "@/store/order";
import { useRecoilState, useRecoilValue } from "recoil";

const SelectedItemTable = ({
  items,
  removeItem,
  editItem,
  delivered,
}: {
  delivered: boolean
  items: z.infer<typeof createOrderType>["order_items"];
  removeItem: (item_id: number) => void;
  editItem: (
    value: z.infer<typeof createOrderType>["order_items"][number]
  ) => void;
}) => {
  const { items: allItems } = useAllItems();
  const showCommission = useRecoilValue(showCommissionAtom);
  return (
    <div>
      <div className="text-2xl font-cubano flex items-center justify-between">
        <span>Selected Items</span>
        <ShowCommissionButton/>
      </div>
      <Table>
        <TableCaption>A list of added items.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Item Name</TableHead>
            <TableHead className="text-center">Quantity</TableHead>
            <TableHead className="text-center">Rate</TableHead>
            <TableHead className="text-center">Total Value</TableHead>
            {showCommission && <TableHead className="text-center">Architect Commission</TableHead>}
            {showCommission && <TableHead className="text-center">Carpanter Commission</TableHead>}
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
                <TableCell className="text-center">{`${item.quantity} piece`}</TableCell>
                <TableCell className="text-center">{`${item.rate} Per ${foundItem?.rate_dimension ?? ""}`}</TableCell>
                <TableCell className="text-center">
                  {item.total_value}
                </TableCell>
                {showCommission && <TableCell className="text-center">
                  {`₹${item.architect_commision} ${calculateCommissionFromTotalCommission(item.architect_commision, item.architect_commision_type, item.total_value, item.quantity).bracket}`}
                </TableCell>}
                {showCommission && <TableCell className="text-center">
                  {`₹${item.carpanter_commision} ${calculateCommissionFromTotalCommission(item.carpanter_commision, item.carpanter_commision_type, item.total_value, item.quantity).bracket}`}
                </TableCell>}
                <TableCell className="text-center">
                  <AddNewItem delivered={delivered} onSubmit={editItem} value={item}>
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

export const ShowCommissionButton = () => {
  const [showCommission, setShowCommission] = useRecoilState(showCommissionAtom);
  return (
    <Button variant={"outline"} className="aspect-square p-0 h-8 opacity-15 hover:opacity-50" onClick={() => setShowCommission(!showCommission)}>
        {!showCommission ? <Eye/> : <EyeOff/>}
    </Button>
  );
}


export default SelectedItemTable;