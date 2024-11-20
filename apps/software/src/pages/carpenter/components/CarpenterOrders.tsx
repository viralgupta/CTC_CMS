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
import { viewCarpenterAtom} from "@/store/carpenter";
import React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

const CarpenterOrders = () => {
  const viewCarpenter = useRecoilValue(viewCarpenterAtom);
  const setViewOrderId = useSetRecoilState(viewOrderIdAtom);
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: (viewCarpenter?.orders ?? []).length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 34,
    overscan: 2,
  });

  if (!viewCarpenter) return <Skeleton className="w-full h-46" />;

  return (
    <div className="mt-2 max-h-96 overflow-y-auto hide-scroll" ref={parentRef}>
      <span className="font-sofiapro font-bold text-xl">Orders</span>
      <Table
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        <TableCaption>A list of Orders linked to Carpenter</TableCaption>
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
        <TableBody>
          {(viewCarpenter.orders ?? []).length > 0 &&
            virtualizer.getVirtualItems().map((virtualRow, index) => {
              const order = viewCarpenter.orders[virtualRow.index];
              return (
                <TableRow key={order.id}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${
                      virtualRow.start - index * virtualRow.size
                    }px)`,
                  }}
                >
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
                    ₹{order.carpanter_commision ?? "0.00"}
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

export default CarpenterOrders;
