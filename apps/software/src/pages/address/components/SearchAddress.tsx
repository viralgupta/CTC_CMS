import React from "react";
import { Skeleton } from "@/components/ui/skeleton"
import { useAllAddresses } from "@/hooks/addresses"
import AddressTable from "./AddressTable"
import { ColumnFiltersState } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import AddressAreaInput from "@/components/Inputs/AddressInput/AddressAreaInput";
import { AddressType } from "@/store/address";
import RefetchButton from "@/components/RefetchButton";
import { Button } from "@/components/ui/button";

const SearchAddress = ({
  onChange,
  filterCustomerId
}: {
  onChange?: (addId: string) => void;
  filterCustomerId?: string;
}) => {
  const { addresses, loading, refetchAddresses } = useAllAddresses();
  const defaultColumnFilterValue = [
    { id: "house_number", value: "" },
    { id: "address", value: "" },
  ];
  const [columnFilter, setColumnFilter] = React.useState<ColumnFiltersState>(defaultColumnFilterValue);
  const [areaId, setAreaId] = React.useState("")

  const setCustomerSearchFilterValue = (
    key: "house_number" | "address",
    value: string
  ) => {
    if (!value || value == "") {
      return setColumnFilter((cf) => {
        return cf.map((filter) =>
          filter.id === key ? { ...filter, value: "" } : filter
        );
      });
    }
    setColumnFilter((cf) => {
      return cf.map((filter) =>
        filter.id === key ? { ...filter, value: value } : filter
      );
    });
  };
  
  const filterAddressByArea = (addresses: AddressType[]) => {
    if(!areaId) return addresses;
    return addresses.filter(a => a.address_area.id == areaId)
  }

  const filterAddressByCustomer = (addresses: AddressType[]) => {
    if(!filterCustomerId) return addresses;
    return addresses.filter(a => a.customer.id == filterCustomerId)
  }

  return (
    <div className="w-full h-full">
      <div className="font-cubano text-3xl mb-2">Search Addresses</div>
      <div className="w-full mb-4 h-12 flex space-x-2">
        <Input
          placeholder="Search House Number..."
          onChange={(e) => {
            return setCustomerSearchFilterValue("house_number", e.target.value)
          }}
          className="rounded-sm w-1/4 h-full"
        />
        <Input
          placeholder="Search Address..."
          onChange={(e) => {
            return setCustomerSearchFilterValue("address", e.target.value)
          }}
          className="rounded-sm w-1/2 h-full"
        />
        <AddressAreaInput
          onChange={setAreaId}
          value={areaId}
          className="h-full w-1/4"
        />
        {areaId !== "" && <Button className="h-full" variant={"outline"} onClick={(e) => {
          return setAreaId("");
        }}>
          Clear Area
        </Button>}
        <RefetchButton
           description="Refetch All Addresses"
           refetchFunction={refetchAddresses}
           className="py-0.5"
        />
      </div>
      {loading ? (
        <Skeleton className="w-full h-full" />
      ) : (
        <AddressTable
          CompKey="Main Address Table"
          data={filterAddressByCustomer(filterAddressByArea(addresses))}
          columnFilters={columnFilter}
          onChange={onChange}
        />
      )}
    </div>
  );
}

export default SearchAddress;