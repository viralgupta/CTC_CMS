import LogButton from "@/components/log/logButton";
import ItemTable from "./ItemTable";
import RefetchButton from "@/components/RefetchButton";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllItems } from "@/hooks/items";

const AllItems = () => {
  const { items, loading, refetchItems } = useAllItems();

  return (
    <div className="mt-4">
      <div className="text-3xl font-cubano mb-4 flex justify-between items-center">
        <div>All Items</div>
        <div className="flex gap-2">
          <RefetchButton
            refetchFunction={refetchItems}
            description="Refetch All Items"
            className="w-8 h-8 p-1"
          />
          <LogButton value={{linked_to: "ITEM"}}/>
        </div>
      </div>
      {loading ? (
        <Skeleton className="w-full h-48" />
      ) : (
        <ItemTable CompKey="AllItemsTable" data={items} />
      )}
    </div>
  );
};

export default AllItems;
