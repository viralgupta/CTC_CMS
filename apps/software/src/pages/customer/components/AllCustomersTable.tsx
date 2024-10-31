import { Skeleton } from "@/components/ui/skeleton";
import { useAllCustomer } from "@/hooks/customers"
import CustomerTable from "./CustomerTable";
import RefetchButton from "@/components/RefetchButton";
import LogButton from "@/components/log/logButton";

const AllCustomersTable = () => {
  const { customers, loading, refetchCustomers} = useAllCustomer();
  if (loading) {
    return <Skeleton className="w-full h-96 mt-4"/>
  } else {
    return (
      <div className="mt-5">
        <div className="text-3xl font-cubano mb-4 flex items-center justify-between">
          <span>All Customers</span>
          <div className="flex gap-2">
            <RefetchButton description="Refetch All Customers" refetchFunction={refetchCustomers} className="h-8"/>
            <LogButton value={{linked_to: "CUSTOMER"}}/>
          </div>
        </div>
        <CustomerTable CompKey="AllCustomerTable" data={customers} />
      </div>
    );
  }
}

export default AllCustomersTable