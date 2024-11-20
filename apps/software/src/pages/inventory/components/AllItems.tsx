import LogButton from "@/components/log/LogButton";
import ItemTable from "./ItemTable";
import RefetchButton from "@/components/RefetchButton";
import { Skeleton } from "@/components/ui/skeleton";
import { useAllItems } from "@/hooks/items";

const AllItems = () => {
  const { items, loading, refetchItems } = useAllItems();

  return (
    <div className="flex-1 flex flex-col">
      <div className="text-3xl font-cubano mb-4 flex justify-between items-center flex-none mt-4">
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
        <Skeleton className="w-full flex-1" />
      ) : (
        <ItemTable CompKey="AllItemsTable" data={items} />
      )}
    </div>
  );
};

export default AllItems;
