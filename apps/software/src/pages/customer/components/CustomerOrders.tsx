import { viewCustomerAtom, viewCustomerType } from "@/store/customer";
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

const CustomerOrders = () => {
  const viewCustomer = useRecoilValue(viewCustomerAtom);
  if (!viewCustomer) return <Skeleton className="w-full h-46"/>;
  return <div className="mt-2">
    <span className="font-sofiapro font-bold text-xl">Pending Orders</span>
    <CustomerOrderTable caption="A list of customer's Active orders." orders={viewCustomer.orders.filter((order) => order.status === "Pending")} />
    <span className="font-sofiapro font-bold text-xl">Completed Orders</span>
    <CustomerOrderTable caption="A list of customer's Completed orders." orders={viewCustomer.orders.filter((order) => order.status === "Delivered")} />
  </div>;
};

export const CustomerOrderTable = ({
  caption,
  orders,
}: {
  caption: string;
  orders: viewCustomerType["orders"];
}) => {
  const setViewOrderId = useSetRecoilState(viewOrderIdAtom);

  return (
    <Table>
      <TableCaption>{caption}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className={`text-center`}>Total Amount</TableHead>
          <TableHead className={`text-center`}>Priority</TableHead>
          <TableHead className={`text-center`}>Status</TableHead>
          <TableHead className={`text-center`}>Payment Status</TableHead>
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
                  {order.total_order_amount}
                </TableCell>
                <TableCell className={`text-center`}>
                  {order.priority}
                </TableCell>
                <TableCell className={`text-center`}>{order.status}</TableCell>
                <TableCell
                  className={`text-center ${order.payment_status == "UnPaid" ? "text-red-500" : order.payment_status == "Partial" ? "text-yellow-300" : "text-green-500"}`}
                >
                  {order.payment_status}
                </TableCell>
                <TableCell className={`text-center`}>
                  {parseDateToString(order.created_at)}
                </TableCell>
                <TableCell className={`text-center`}>
                  <Button size={"sm"} onClick={() => {setViewOrderId(order.id)}}>
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

export default CustomerOrders;
