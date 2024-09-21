import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { BoxIcon, Edit2Icon, Trash2Icon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import request from "@/utils/request";
import { useSetRecoilState } from "recoil";
import allItemsAtom, { editItemIDAtom, editItemQuantityIDAtom, viewItemIDAtom } from "@/store/inventory/Items";

interface ItemType {
  id: string;
  name: string;
  category:
    | "Adhesives"
    | "Plywood"
    | "Laminate"
    | "Veneer"
    | "Decorative"
    | "Moulding"
    | "Miscellaneous"
    | "Door";
  quantity: number;
  min_quantity: number;
  sale_rate: number;
  rate_dimension: "Rft" | "sq/ft" | "piece";
  multiplier: number;
  min_rate: number | null;
}

export default function ItemCard({ item }: { item: ItemType | null }) {
  const setEditItemQuantityID = useSetRecoilState(editItemQuantityIDAtom);
  const setEditItemID = useSetRecoilState(editItemIDAtom);
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
            <h2 className="text-2xl font-bold mb-2">{item.name}</h2>
            <div className="flex items-center space-x-2">
              <span className="text-lg text-muted-foreground">
                ID: {item.id}
              </span>
            </div>
            <div className="flex space-x-2 mt-2">
              <Button size="sm" variant="outline" onClick={()=>{setEditItemQuantityID(item.id)}}>
                <BoxIcon className="h-4 w-4 mr-2"/>
                Edit Quantity
              </Button>
              <Button size="sm" variant="outline" onClick={()=>setEditItemID(item.id)}>
                <Edit2Icon className="h-4 w-4 mr-2"/>
                Edit Item
              </Button>
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
              <p className="text-lg">{item.quantity}</p>
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

const DeleteItem = ({
  children,
  itemId,
}: {
  children: React.ReactNode;
  itemId: string;
}) => {
  const setAllItems = useSetRecoilState(allItemsAtom);
  const setViewItemId = useSetRecoilState(viewItemIDAtom);

  const handleDelete = async () => {
    const res = await request.delete("/inventory/deleteItem", {
      data: {
        item_id: itemId,
      },
    });
    if(res.status == 200) {
      setAllItems([]);
      setViewItemId(null);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete item?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete item and
            remove data from servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
