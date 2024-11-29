import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import RefetchButton from "@/components/RefetchButton";
import { cn, setDebouncedValue } from "@/lib/utils";
import { useAllCarpenter } from "@/hooks/carpenter";
import CarpenterTable from "./CarpanterTable";

const SearchCarpenter = ({
  onChange,
  value,
  className
}: {
  onChange?: (arcId: number) => void;
  value?: number;
  className?: string;
}) => {
  const { carpenters, loading, refetchCarpenters } = useAllCarpenter();
  const defaultColumnFilterValue = [
    { id: "name", value: "" },
    { id: "phone_number", value: "" },
  ];
  const [columnFilters, setColumnFilters] = React.useState(
    defaultColumnFilterValue
  );
  const [open, setOpen] = React.useState(false);

  const handleModelOpenChange = (o: boolean) => {
    setOpen(o);
    if (o == false) {
      setColumnFilters(defaultColumnFilterValue);
    }
  };

  // set filter value for phone_number if the string is a valid number and greater than 3 in length
  const setCarpenterSearchFilterValue = (value: string) => {
    if (!value || value == "")
      return setColumnFilters(defaultColumnFilterValue);
    if (value.length > 2 && !isNaN(Number(value))) {
      setColumnFilters([
        { id: "name", value: "" },
        { id: "phone_number", value: value },
      ]);
    } else {
      setColumnFilters([
        { id: "name", value: value },
        { id: "phone_number", value: "" },
      ]);
    }
  };

  return (
    <Dialog onOpenChange={handleModelOpenChange} open={open}>
      <DialogTrigger className="w-full">
        <Input
          className={cn("border border-border rounded-full w-full h-12", className)}
          placeholder={value ? carpenters.find(c => c.id == value)?.name ?? value.toString() ?? "--" : "Search for carpenter..."}
        />
      </DialogTrigger>
      <DialogContent size="6xl">
        <DialogHeader>
          <DialogTitle>Search for carpenter...</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <div className="flex flex-row-reverse">
          <div className="w-full h-10 flex items-center">
            <Input
              className="border ml-4 border-border rounded-full w-full h-full"
              placeholder="Search for carpenter..."
              onChange={(event) =>
                setDebouncedValue({
                  key: "CarpenterFilterValue",
                  value: event.target.value ?? "",
                  setFunction: setCarpenterSearchFilterValue,
                  delay: 1000,
                })
              }
            />
            <RefetchButton
              description="Refetch All Carpenters"
              refetchFunction={refetchCarpenters}
              className="h-full aspect-square ml-4 p-1"
            />
          </div>
        </div>
        <div className="w-full h-96 overflow-y-auto">
          {loading ? (
            <Skeleton className="w-full h-96" />
          ) : (
            <CarpenterTable
              CompKey="SearchCarpenterTable"
              columnFilters={columnFilters}
              data={carpenters}
              onChange={onChange ? (v) => {
                onChange(v);
                setOpen(false);
              } : undefined}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchCarpenter;
