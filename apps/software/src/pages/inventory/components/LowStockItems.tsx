import ItemTable from "./ItemTable";
import RefetchButton from "@/components/RefetchButton";
import { Skeleton } from "@/components/ui/skeleton";
import { itemType } from "@/store/Items";
import { useAllItems } from "@/hooks/items";

const LowStockItems = () => {
  const { items, loading, refetchItems } = useAllItems();

  const filterLowStockItems = (items: itemType[]) => {
    return items.filter((item) => item.quantity < item.min_quantity);
  };

  return (
    <div className="mt-8">
      <div className="text-3xl font-cubano mb-4 flex justify-between items-center">
        <div>Items Low in Stock</div>
        <div>
          <RefetchButton
            refetchFunction={refetchItems}
            description="Refetch All Items"
            className="w-8 h-8 p-1"
          />
        </div>
      </div>
      {loading ? (
        <Skeleton className="w-full h-48" />
      ) : (
        <ItemTable CompKey="LowStockItemTable" data={filterLowStockItems(items)} />
      )}
    </div>
  );
};

export default LowStockItems;
