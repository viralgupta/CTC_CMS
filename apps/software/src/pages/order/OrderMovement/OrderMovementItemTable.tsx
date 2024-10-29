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
import { viewMovementType } from "./OrderMovement";

const OrderMovementItemTable = ({
  order_movement_items,
  type
}: {
  order_movement_items: viewMovementType["order_movement_items"];
  type: viewMovementType["type"] | undefined
}) => {
  if (!order_movement_items) return <Skeleton className="w-full h-96" />;
  return (
    <Table>
      <TableCaption>A list of items in the {(type ?? "movement").toLowerCase()}.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Item Name</TableHead>
          <TableHead className="text-center">Total Quantity</TableHead>
          <TableHead className="text-center">
            Quantity in this {type == "RETURN" ? "Return" : "Delivery"}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {order_movement_items.map((om) => {
          return (
            <TableRow key={om.id}>
              <TableCell className="text-center">
                {om.order_item.item.name}
              </TableCell>
              <TableCell className="text-center">
                {om.order_item.quantity}
              </TableCell>
              <TableCell className="text-center">{om.quantity}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default OrderMovementItemTable;
