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
import { viewDriverAtom, ViewDriverType } from "@/store/driver";

const DriverOrderMovements = () => {
  const viewDriver = useRecoilValue(viewDriverAtom);
  if (!viewDriver) return <Skeleton className="w-full h-46" />;
  return (
    <div className="mt-2">
      <span className="font-sofiapro font-bold text-xl">All Movements</span>
      <DriverMovementTable
        caption="A list of driver's movements."
        order_movements={viewDriver.order_movements}
      />
    </div>
  );
};

const DriverMovementTable = ({
  caption,
  order_movements,
}: {
  caption: string;
  order_movements: ViewDriverType["order_movements"];
}) => {
  const setViewOrderId = useSetRecoilState(viewOrderIdAtom);
  const setViewOrderMovementId = useSetRecoilState(viewOrderMovementIdAtom);

  return (
    <Table>
      <TableCaption>{caption}</TableCaption>
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
        {order_movements.length > 0 &&
          order_movements.map((order_movement) => {
            return (
              <TableRow key={order_movement.id}>
                <TableCell className={`text-center`}>{order_movement.type}</TableCell>
                <TableCell
                  className={`text-center ${order_movement.status == "Completed" ? "text-green-500" : "text-red-500"}`}
                >
                  {order_movement.status.toUpperCase()}
                </TableCell>
                <TableCell className={`text-center`}>
                  {order_movement.order.customer?.name ?? "--"}
                </TableCell>
                <TableCell className={`text-center`}>
                  {order_movement.order.delivery_address?.house_number ?? "--"}
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
  );
};

export default DriverOrderMovements;
