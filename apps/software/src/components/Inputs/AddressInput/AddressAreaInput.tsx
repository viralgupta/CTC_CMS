import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "../../ui/input";
import { useAddressAreas } from "@/hooks/addressArea";
import RefetchButton from "../../RefetchButton";
import { Button } from "../../ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "../../ui/skeleton";
import { addAddressAreaType } from "@type/api/customer";
import { toast } from "sonner";
import request from "@/lib/request";
import Spinner from "../../ui/Spinner";
import Fuse from "fuse.js";

type AddressAreaInputProps = {
  onChange: (value: string) => void;
  value: string;
};

const AddressAreaInput = ({ onChange, value }: AddressAreaInputProps) => {
  const [open, setOpen] = useState(false);
  const [inputAddressArea, setInputAddressArea] = useState("");
  const [addAddressAreaLoading, setAddAddressAreaLoading] = useState(false);
  const { addressAreas, loading, refetchAddressAreas } = useAddressAreas();

  const AddAddressArea = async () => {
    setAddAddressAreaLoading(true);
    const addressAreaToAdd = addAddressAreaType.safeParse({
      area: inputAddressArea,
    });
    if (addressAreaToAdd.success) {
      const res = await request.post(
        "/customer/addAddressArea",
        addressAreaToAdd.data
      );
      if (res.status == 200) {
        setInputAddressArea("");
        refetchAddressAreas();
      }
    } else {
      toast.error(addressAreaToAdd.error.message);
    }
    setAddAddressAreaLoading(false);
  };

  const fuse = new Fuse(addressAreas, {
    keys: ["area"],
  });

  return (
    <Dialog
      onOpenChange={(o) => {
        setInputAddressArea("");
        setOpen(o);
      }}
      open={open}
    >
      <DialogTrigger className="w-full">
        <Input
          placeholder={
            value ? addressAreas.find((area) => area.id == value)?.area : ""
          }
        />
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Select Address Area</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <div className="w-full h-10 flex items-center">
          <Input
            className="border border-border rounded-full w-full h-10"
            placeholder="Search for address area..."
            value={inputAddressArea}
            onChange={(e) => setInputAddressArea(e.target.value ?? "")}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size={"icon"}
                variant={"outline"}
                className="aspect-square ml-4"
              >
                <Plus className="w-full h-full p-1 stroke-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="flex items-center space-x-2"
              align="start"
            >
              <Input
                placeholder="New Address Area..."
                type="text"
                value={inputAddressArea}
                onChange={(e) => setInputAddressArea(e.target.value ?? "")}
              />
              <Button onClick={AddAddressArea} disabled={addAddressAreaLoading}>
                {addAddressAreaLoading ? <Spinner /> : "Add"}
              </Button>
            </PopoverContent>
          </Popover>
          <RefetchButton
            description="Refetch All Address Areas"
            refetchFunction={refetchAddressAreas}
            className="h-full aspect-square ml-2 p-2"
          />
        </div>
        <div className="w-full h-full">
          {loading ? (
            <Skeleton className="w-full h-96" />
          ) : (
            <div className="w-full max-h-96 overflow-y-auto hide-scroll space-y-1">
              {addressAreas.length > 0 ? (
                inputAddressArea.length > 0 ? (
                  fuse.search(inputAddressArea).map((area, index) => {
                    return (
                      <div className="w-full flex space-x-1" key={index}>
                        <Button
                          variant={"ghost"}
                          className="w-full border border-border border-x-0 border-y"
                          onClick={() => {
                            onChange(area.item.id);
                            setOpen(false);
                          }}
                        >
                          {area.item.area}
                        </Button>
                        <Button type="button" size={"icon"} onClick={()=> {
                          request.delete("/customer/deleteAddressArea", {
                            data: {
                              address_area_id: area.item.id
                            }
                          }).then((res) => {
                            if (res.status == 200) {
                              refetchAddressAreas();
                            }
                          })
                        }}>
                          <Trash2 className="w-full h-full p-1 stroke-foreground" />
                        </Button>
                      </div>
                    );
                  })
                ) : (
                  addressAreas.map((area, index) => {
                    return (
                      <div className="w-full flex space-x-1" key={index}>
                        <Button
                          variant={"ghost"}
                          className="w-full border border-border border-x-0 border-t-0 border-b"
                          onClick={() => {
                            onChange(area.id);
                            setOpen(false);
                          }}
                        >
                          {area.area}
                        </Button>
                        <Button type="button" size={"icon"} onClick={()=> {
                          request.delete("/customer/deleteAddressArea", {
                            data: {
                              address_area_id: area.id
                            }
                          }).then((res) => {
                            if (res.status == 200) {
                              refetchAddressAreas();
                            }
                          })
                        }}>
                          <Trash2 className="w-full h-full p-1 stroke-foreground" />
                        </Button>
                      </div>
                    );
                  })
                )
              ) : (
                <div className="text-center my-10">No Address Areas Found</div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddressAreaInput;
