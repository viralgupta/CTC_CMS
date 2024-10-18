import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { viewOrderIdAtom } from "@/store/order";
import { parseDateToString } from "@/lib/utils";
import { viewCarpenterAtom, ViewCarpenterType } from "@/store/carpenter";

const CarpenterOrders = () => {
  const viewCarpenter = useRecoilValue(viewCarpenterAtom);
  if (!viewCarpenter) return <Skeleton className="w-full h-46" />;
  return (
    <div className="mt-2">
      <span className="font-sofiapro font-bold text-xl">Pending Orders</span>
      <CarpenterOrderTable
        caption="A list of carpenter's Active orders."
        orders={viewCarpenter.orders.filter(
          (order) => order.status === "Pending"
        )}
      />
      <span className="font-sofiapro font-bold text-xl">Completed Orders</span>
      <CarpenterOrderTable
        caption="A list of carpenter's Completed orders."
        orders={viewCarpenter.orders.filter(
          (order) => order.status === "Delivered"
        )}
      />
    </div>
  );
};

export const CarpenterOrderTable = ({
  caption,
  orders,
}: {
  caption: string;
  orders: ViewCarpenterType["orders"];
}) => {
  const setViewOrderId = useSetRecoilState(viewOrderIdAtom);

  return (
    <Table>
      <TableCaption>{caption}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className={`text-center`}>Customer</TableHead>
          <TableHead className={`text-center`}>House No.</TableHead>
          <TableHead className={`text-center`}>Address</TableHead>
          <TableHead className={`text-center`}>Status</TableHead>
          <TableHead className={`text-center`}>Carpenter Comm.</TableHead>
          <TableHead className={`text-center`}>Date Created</TableHead>
          <TableHead className={`text-center`}>View Order</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="max-h-72 overflow-y-scroll hide-scroll">
        {orders.length > 0 &&
          orders.map((order) => {
            return (
              <TableRow key={order.id}>
                <TableCell className={`text-center`}>
                  {order.customer?.name ?? "--"}
                </TableCell>
                <TableCell className={`text-center`}>
                  {order.delivery_address?.house_number ?? "--"}
                </TableCell>
                <TableCell className={`text-center`}>
                  {order.delivery_address?.address ?? "--"}
                </TableCell>
                <TableCell
                  className={`text-center ${order.status == "Pending" ? "text-red-500" : "text-green-500"}`}
                >
                  {order.status}
                </TableCell>
                <TableCell className={`text-center`}>
                  ₹{order.carpenter_commision ?? "0.00"}
                </TableCell>
                <TableCell className={`text-center`}>
                  {parseDateToString(order.created_at)}
                </TableCell>
                <TableCell className={`text-center`}>
                  <Button
                    size={"sm"}
                    onClick={() => {
                      setViewOrderId(order.id);
                    }}
                  >
                    View Order
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
};

export default CarpenterOrders;
