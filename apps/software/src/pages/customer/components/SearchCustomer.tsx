import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import RefetchButton from "@/components/RefetchButton";
import { setDebouncedValue } from "@/lib/utils";
import { useAllCustomer } from "@/hooks/customers";
import CustomerTable from "@/components/customer/CustomerTable";

const SearchCustomer = () => {
  const { customers, loading, refetchCustomers } = useAllCustomer();
  const [filterValue, setFilterValue] = React.useState("");

  const handleModelOpenChange = (open: boolean) => {
    if (open == false) {
      setFilterValue("")
    }
  }

  return (
    <Dialog onOpenChange={handleModelOpenChange}>
      <DialogTrigger className="w-full">
        <Input className="border border-border rounded-full w-full h-12" placeholder="Search for customers..."/>
      </DialogTrigger>
      <DialogContent size="6xl">
        <DialogHeader>
          <DialogTitle>Search for customers...</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <div className="flex flex-row-reverse">
          <div className="w-full h-10 flex items-center">
            <Input className="border ml-4 border-border rounded-full w-full h-full" placeholder="Search for customer..." onChange={(event) => setDebouncedValue({
              key: "CustomerFilterValue",
              value: event.target.value ?? "",
              setFunction: setFilterValue,
              delay: 1000
            })}/>
            <RefetchButton description="Refetch All Customers" refetchFunction={refetchCustomers} className="h-full aspect-square ml-4 p-1"/>
          </div>
        </div>
        <div className="w-full max-h-96 overflow-y-auto">
           {loading ? <Skeleton className="w-full h-96"/> : <CustomerTable columnFilters={[{id: "name", value: filterValue}]} data={customers}/>} 
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchCustomer;
