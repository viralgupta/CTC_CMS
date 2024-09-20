import ItemTable from "@/components/inventory/ItemsTable";
import RefetchButton from "@/components/RefetchButton";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetchAllItems } from "@/utils/items";

const AllItems = () => {
  const { items, loading, refetchItems } = useFetchAllItems();

  return (
    <div className="mt-8">
      <div className="text-3xl font-cubano mb-4 flex justify-between items-center">
        <div>All Items</div>
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
        <ItemTable data={items} />
      )}
    </div>
  );
};

export default AllItems;
