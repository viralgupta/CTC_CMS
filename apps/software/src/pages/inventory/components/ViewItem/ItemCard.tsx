import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BoxIcon, Edit2Icon, Trash2Icon } from "lucide-react";
import {
  viewItemType,
} from "@/store/Items";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import React from "react";
import ItemOrders from "./ItemOrders/ItemOrder";
import LogButton from "@/components/log/logButton";
import EditItem from "./EditItem";
import DeleteItem from "./DeleteItem";

export default function ItemCard({ item }: { item: viewItemType | null }) {

  if (!item) {
    return (
      <Card className="w-full p-6">
        <Skeleton className="w-full h-40" />
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold mb-2 flex justify-between items-center">{item.name}
            <LogButton value={{type: {"item_id": item.id}}}/>
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                ID: {item.id}
              </span>
            </div>
            <div className="flex space-x-2 mt-2">
              <EditItem>
                <Button size="sm" variant="outline">
                  <Edit2Icon className="h-4 w-4 mr-2" />
                  Edit Item
                </Button>
              </EditItem>
              <ItemOrders item_id={item.id} item_orders={item.item_orders}>
                <Button size="sm" variant="outline">
                  <BoxIcon className="h-4 w-4 mr-2" />
                  Item Orders
                </Button>
              </ItemOrders>
              <DeleteItem itemId={item.id}>
                <Button size="sm" variant="outline">
                  <Trash2Icon className="h-4 w-4 mr-2" />
                  Delete Item
                </Button>
              </DeleteItem>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="mr-10">
              <span className="text-lg font-medium flex items-center">
                Quantity
              </span>
              <ItemStoreQuantity warehouseQuantities={item.warehouse_quantities}>
                <span className="text-lg border px-2 rounded-md cursor-pointer">{item.quantity}</span>
              </ItemStoreQuantity>
            </div>
            <div className="mr-10">
              <span className="text-lg font-medium flex items-center">
                Min Quantity
              </span>
              <p className="text-lg">{item.min_quantity}</p>
            </div>
            <div className="mr-10">
              <span className="text-lg font-medium flex items-center">
                Category
              </span>
              <p className="text-lg">{item.category}</p>
            </div>
            <div className="mr-10">
              <span className="text-lg font-medium flex items-center">
                Sale Rate
              </span>
              <p className="text-lg">
                ₹{item.sale_rate.toFixed(2)} per&nbsp;{item.rate_dimension}
              </p>
            </div>
            <div className="mr-10">
              <div>
                <span className="text-lg font-medium flex items-center">
                  Min Rate
                </span>
                <p className="text-lg">
                  {item.min_rate
                    ? `₹${item.min_rate.toFixed(2)} per ${item.rate_dimension}`
                    : "null"}
                </p>
              </div>
            </div>
            <div className="mr-10">
              <span className="text-lg font-medium flex items-center">
                Multiplier
              </span>
              <p className="text-lg">{item.multiplier}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const ItemStoreQuantity = ({
  warehouseQuantities,
  children
}: {
  warehouseQuantities: viewItemType["warehouse_quantities"];
  children: React.ReactNode;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Warehouse</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouseQuantities.map((wq, i) => (
                <TableRow key={i}>
                  <TableCell className="leading-3 py-4">{wq.warehouse.name}</TableCell>
                  <TableCell className="text-center leading-3 py-4">{wq.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
