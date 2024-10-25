import { Skeleton } from "@/components/ui/skeleton";
import { viewItemType } from "@/store/Items";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useSetRecoilState } from "recoil";
import { viewOrderIdAtom } from "@/store/order";
import { calculateCommissionFromTotalCommission } from "@/lib/utils";

const ViewItemOrdersTable = ({ item }: { item: viewItemType | null }) => {
  if (!item) return <Skeleton className="w-full h-48 mt-2" />;
  const setVIewOrderID = useSetRecoilState(viewOrderIdAtom);

  return (
    <Table>
      <TableCaption>A list of recent order's with this item.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Customer Name</TableHead>
          <TableHead className="text-center">Quantity</TableHead>
          <TableHead className="text-center">Rate</TableHead>
          <TableHead className="text-center">Total Value</TableHead>
          <TableHead className="text-center">Architect Commission</TableHead>
          <TableHead className="text-center">Carpenter Commission</TableHead>
          <TableHead className="text-center">View Order</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {item.order_items.map((oi) => {
          return (
            <TableRow key={oi.id}>
              <TableCell className="text-center">
                {oi.order.customer?.name ?? "--"}
              </TableCell>
              <TableCell className="text-center">{oi.quantity}</TableCell>
              <TableCell className="text-center">{`₹${oi.rate.toFixed(2)} per ${item.rate_dimension}`}</TableCell>
              <TableCell className="text-center">{`₹${oi.total_value}`}</TableCell>
              <TableCell className="text-center">
                {oi.architect_commision
                  ? `₹${oi.architect_commision} ${calculateCommissionFromTotalCommission(oi.architect_commision, oi.architect_commision_type, oi.total_value, oi.quantity).bracket}`
                  : "--"}
              </TableCell>
              <TableCell className="text-center">
                {oi.carpanter_commision
                  ? `₹${oi.carpanter_commision} ${calculateCommissionFromTotalCommission(oi.carpanter_commision, oi.carpanter_commision_type, oi.total_value, oi.quantity).bracket}`
                  : "--"}
              </TableCell>
              <TableCell className="text-center">
                <Button
                  size={"sm"}
                  onClick={() => {
                    setVIewOrderID(oi.order_id);
                  }}
                >
                  View Order
                </Button>
              </TableCell>
            </TableRow>
          );})}
      </TableBody>
    </Table>
  );
};

export default ViewItemOrdersTable;
