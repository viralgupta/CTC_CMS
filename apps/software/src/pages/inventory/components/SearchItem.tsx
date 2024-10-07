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
import SelectCategory from "@/components/Inputs/SelectCategory";
import { itemType } from "@/store/Items";
import { Skeleton } from "@/components/ui/skeleton";
import ItemTable from "./ItemTable";
import { useAllItems } from "@/hooks/items";
import RefetchButton from "@/components/RefetchButton";
import { setDebouncedValue } from "@/lib/utils";

const SearchItem = () => {
  const { items, loading, refetchItems } = useAllItems();
  const [filterValue, setFilterValue] = React.useState("");
  const [category, setCategory] = React.useState("");

  const handleModelOpenChange = (open: boolean) => {
    if (open == false) {
      setFilterValue("")
      setCategory("")
    }
  }
  
  const filterItemsAccordingToCategory = (items: itemType[]) => {
    if(category == ""){
      return items;
    }
    return items.filter(item => item.category == category);
  }

  return (
    <Dialog onOpenChange={handleModelOpenChange}>
      <DialogTrigger className="w-full">
        <Input className="border border-border rounded-full w-full h-12" placeholder="Search for item..."/>
      </DialogTrigger>
      <DialogContent size="6xl">
        <DialogHeader>
          <DialogTitle>Search for items in inventory...</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <div className="flex flex-row-reverse">
          <div className="w-full h-10 flex items-center">
            <Input className="border ml-4 border-border rounded-full w-full h-full" placeholder="Search for item..." onChange={(event) => setDebouncedValue({
              key: "itemFilterValue",
              value: event.target.value ?? "",
              setFunction: setFilterValue,
              delay: 1000
            })}/>
            <RefetchButton description="Refetch All Items" refetchFunction={refetchItems} className="h-full aspect-square ml-4 p-1"/>
          </div>
          <SelectCategory className="w-1/2" onValueChange={setCategory}/>
        </div>
        <div className="w-full max-h-96 overflow-y-auto">
           {loading ? <Skeleton className="w-full h-96"/> : <ItemTable CompKey="SearchItemTable" columnFilters={[{id: "name", value: filterValue}]} data={filterItemsAccordingToCategory(items)}/>} 
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchItem;
