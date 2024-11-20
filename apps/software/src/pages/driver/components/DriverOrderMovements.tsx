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
import { viewOrderIdAtom, viewOrderMovementIdAtom } from "@/store/order";
import { parseDateToString } from "@/lib/utils";
import { viewDriverAtom } from "@/store/driver";
import React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

const DriverOrderMovements = () => {
  const viewDriver = useRecoilValue(viewDriverAtom);
  const setViewOrderId = useSetRecoilState(viewOrderIdAtom);
  const setViewOrderMovementId = useSetRecoilState(viewOrderMovementIdAtom);

  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: (viewDriver?.order_movements ?? []).length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 34,
    overscan: 2,
  });

  if (!viewDriver) return <Skeleton className="w-full h-46" />;

  return (
    <div className="max-h-96 overflow-y-auto hide-scroll" ref={parentRef}>
      <span className="font-sofiapro font-bold text-xl">All Movements</span>
      <Table>
        <TableCaption>A list of driver's Movement</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className={`text-center`}>Type</TableHead>
            <TableHead className={`text-center`}>Status</TableHead>
            <TableHead className={`text-center`}>Customer</TableHead>
            <TableHead className={`text-center`}>House No.</TableHead>
            <TableHead className={`text-center`}>Address</TableHead>
            <TableHead className={`text-center`}>Amount</TableHead>
            <TableHead className={`text-center`}>Date Created</TableHead>
            <TableHead className={`text-center`}>View Order</TableHead>
            <TableHead className={`text-center`}>View Movement</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="max-h-72 overflow-y-scroll hide-scroll">
          {(viewDriver.order_movements ?? []).length > 0 &&
            virtualizer.getVirtualItems().map((virtualRow, index) => {
              const order_movement =
                viewDriver.order_movements[virtualRow.index];
              return (
                <TableRow
                  key={order_movement.id}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${
                      virtualRow.start - index * virtualRow.size
                    }px)`,
                  }}
                >
                  <TableCell className={`text-center`}>
                    {order_movement.type}
                  </TableCell>
                  <TableCell
                    className={`text-center ${order_movement.status == "Completed" ? "text-green-500" : "text-red-500"}`}
                  >
                    {order_movement.status.toUpperCase()}
                  </TableCell>
                  <TableCell className={`text-center`}>
                    {order_movement.order.customer?.name ?? "--"}
                  </TableCell>
                  <TableCell className={`text-center`}>
                    {order_movement.order.delivery_address?.house_number ??
                      "--"}
                  </TableCell>
                  <TableCell className={`text-center`}>
                    {order_movement.order.delivery_address?.address ?? "--"}
                  </TableCell>
                  <TableCell className={`text-center`}>
                    {order_movement.labour_frate_cost.toFixed(2)}
                  </TableCell>
                  <TableCell className={`text-center`}>
                    {parseDateToString(order_movement.created_at)}
                  </TableCell>
                  <TableCell className={`text-center`}>
                    <Button
                      size={"sm"}
                      onClick={() => {
                        setViewOrderId(order_movement.order.id);
                      }}
                    >
                      View Order
                    </Button>
                  </TableCell>
                  <TableCell className={`text-center`}>
                    <Button
                      size={"sm"}
                      onClick={() => {
                        setViewOrderMovementId(order_movement.id);
                      }}
                    >
                      View Movement
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

export default DriverOrderMovements;
