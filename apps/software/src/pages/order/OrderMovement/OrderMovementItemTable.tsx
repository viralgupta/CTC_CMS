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
import { ItemStoreQuantity } from "@/pages/inventory/components/ViewItem/ItemCard";

const OrderMovementItemTable = ({
  warehouseQuantities,
  order_movement_items,
  type
}: {
  warehouseQuantities: viewMovementType["warehouse_quantities"];
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
              <TableCell className="text-center">
                <ItemStoreQuantity
                  warehouseQuantities={om.o_m_i_w_q.map(
                    (omiwq) => {
                      const foundWarehouseQuantityName = (warehouseQuantities ?? []).find((wq) => wq.id == omiwq.warehouse_quantity_id);
                      if (foundWarehouseQuantityName) {
                        return {
                          id: omiwq.warehouse_quantity_id,
                          warehouse: {
                            name: foundWarehouseQuantityName.warehouse.name,
                          },
                          quantity: omiwq.quantity,
                        };
                      } else {
                        return {
                          id: omiwq.warehouse_quantity_id,
                          warehouse: {
                            name: "--",
                          },
                          quantity: omiwq.quantity,
                        };
                      }
                    }
                  )}
                >
                  <span className="border p-2 rounded-md cursor-pointer">
                    {om.quantity}
                  </span>
                </ItemStoreQuantity>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default OrderMovementItemTable;
