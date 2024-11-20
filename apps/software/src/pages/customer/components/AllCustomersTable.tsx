import { Skeleton } from "@/components/ui/skeleton";
import { useAllCustomer } from "@/hooks/customers"
import CustomerTable from "./CustomerTable";
import RefetchButton from "@/components/RefetchButton";
import LogButton from "@/components/log/LogButton";

const AllCustomersTable = () => {
  const { customers, loading, refetchCustomers} = useAllCustomer();

  return (
    <div className="mt-5 space-y-4 flex-1 flex flex-col">
      <div className="text-3xl font-cubano flex items-center justify-between flex-none mb-3">
        <span>All Customers</span>
        <div className="flex gap-2">
          <RefetchButton
            description="Refetch All Customers"
            refetchFunction={refetchCustomers}
            className="h-8"
          />
          <LogButton value={{ linked_to: "CUSTOMER" }} />
        </div>
      </div>
      {loading ? (
        <Skeleton className="w-full flex-1" />
      ) : (
        <CustomerTable CompKey="AllCustomerTable" data={customers} />
      )}
    </div>
  );
}

export default AllCustomersTable