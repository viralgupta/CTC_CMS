import { viewCustomerAtom } from "@/store/customer";
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
import React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

const CustomerOrders = () => {
  const viewCustomer = useRecoilValue(viewCustomerAtom);
  const setViewOrderId = useSetRecoilState(viewOrderIdAtom);

  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: (viewCustomer?.orders ?? []).length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 34,
    overscan: 2,
  });

  if (!viewCustomer) return <Skeleton className="w-full h-46" />;

  return (
    <div
      className="max-h-96 overflow-y-auto hide-scroll"
      ref={parentRef}
    >
      <Table
        className="flex-1"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        <TableCaption>List of Customer's Orders</TableCaption>
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
        <TableBody>
          {(viewCustomer.orders ?? []).length > 0 &&
            virtualizer.getVirtualItems().map((virtualRow, index) => {
              const order = viewCustomer.orders[index];
              return (
                <TableRow
                  key={Math.random() * 1000}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${
                      virtualRow.start - index * virtualRow.size
                    }px)`,
                  }}
                >
                  <TableCell className={`text-center`}>
                    {order.total_order_amount}
                  </TableCell>
                  <TableCell className={`text-center`}>
                    {order.priority}
                  </TableCell>
                  <TableCell
                    className={`text-center ${order.status == "Pending" ? "text-red-500" : "text-green-500"}`}
                  >
                    {order.status}
                  </TableCell>
                  <TableCell
                    className={`text-center ${order.payment_status == "UnPaid" ? "text-red-500" : order.payment_status == "Partial" ? "text-yellow-300" : "text-green-500"}`}
                  >
                    {order.payment_status}
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
    </div>
  );
};

export default CustomerOrders;
