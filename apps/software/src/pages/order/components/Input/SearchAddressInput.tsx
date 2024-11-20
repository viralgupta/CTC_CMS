import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Address from "@/pages/address/page";
import { Input } from "@/components/ui/input";
import { useAllAddresses } from "@/hooks/addresses";

const SearchAddressInput = ({
  value,
  onChange,
  filterCustomerId,
}: {
  value?: string;
  onChange: (id: string) => void;
  filterCustomerId?: string;
}) => {
  const { addresses } = useAllAddresses();
  const [open, setOpen] = React.useState(false);

  const foundAddress = addresses.find((a) => value == a.id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="w-full">
        <Input
          className="w-full rounded-lg"
          placeholder={
            value && foundAddress
              ? `${foundAddress.house_number}, ${foundAddress.address}`
              : "Select Address..."
          }
        />
      </DialogTrigger>
      <DialogContent size="4xl">
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Address
          onChange={
            onChange
              ? (v) => {
                  onChange(v);
                  setOpen(false);
                }
              : undefined
          }
          filterCustomerId={filterCustomerId}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SearchAddressInput;
