import { Skeleton } from "@/components/ui/skeleton";
import { ViewOrderType } from "@/store/order";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { viewItemIDAtom } from "@/store/Items";
import { useSetRecoilState } from "recoil";
import { Button } from "@/components/ui/button";
import { calculateCommissionFromTotalCommission } from "@/lib/utils";

const OrderItemsTable = ({
  order_items,
}: {
  order_items: ViewOrderType["order_items"];
}) => {
  if (!order_items) return <Skeleton className="w-full h-48 mt-2" />;
  const setVIewItemID = useSetRecoilState(viewItemIDAtom);

  return (
    <Table>
      <TableCaption>A list of items in the order.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Name</TableHead>
          <TableHead className="text-center">Quantity</TableHead>
          <TableHead className="text-center">Delivered Quanitity</TableHead>
          <TableHead className="text-center">Rate</TableHead>
          <TableHead className="text-center">Total Value</TableHead>
          <TableHead className="text-center">Architect Commission</TableHead>
          <TableHead className="text-center">Carpenter Commission</TableHead>
          <TableHead className="text-center">View Item</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {order_items.map((oi) => {
          return (
            <TableRow key={oi.item_id}>
              <TableCell className="text-center">{oi.item?.name}</TableCell>
              <TableCell className="text-center">{oi.quantity}</TableCell>
              <TableCell className={`text-center ${oi.quantity > oi.delivered_quantity && "text-red-500"}`}>
                <p className={`w-min mx-auto ${oi.quantity < oi.delivered_quantity && "bg-primary p-1 px-2 animate-pulse rounded-md text-white"}`}>
                  {oi.delivered_quantity}
                </p>
              </TableCell>
              <TableCell className="text-center">{`₹${oi.rate.toFixed(2)} per ${oi.item?.rate_dimension}`}</TableCell>
              <TableCell className="text-center">{`₹${oi.total_value}`}</TableCell>
              <TableCell className="text-center">
                {oi.architect_commision
                  ? `₹${oi.architect_commision} ${calculateCommissionFromTotalCommission(oi.architect_commision, oi.architect_commision_type, oi.total_value, oi.quantity).bracket}`
                  : "--"}
              </TableCell>
              <TableCell className="text-center">
                {oi.carpenter_commision
                  ? `₹${oi.carpenter_commision} ${calculateCommissionFromTotalCommission(oi.carpenter_commision, oi.carpenter_commision_type, oi.total_value, oi.quantity).bracket}`
                  : "--"}
              </TableCell>
              <TableCell className="text-center">
                <Button
                  size={"sm"}
                  onClick={() => {
                    setVIewItemID(oi.item_id);
                  }}
                >
                  View Item
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default OrderItemsTable;
