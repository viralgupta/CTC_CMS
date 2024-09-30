import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FakeButton } from "@/components/ui/fake-button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";

type CordinatesInputProps = {
  onCordinateSelect: (lat: number, long: number) => void;
  values: {
    latitude: number;
    longitude: number;
  };
  disabled?: boolean;
  getAddress: () => string;
};

const CordinatesInput = ({
  values,
  onCordinateSelect,
  disabled,
  getAddress,
}: CordinatesInputProps) => {
  const [address, setAddress] = React.useState("");

  return (
    <Dialog
      onOpenChange={(o) => {
        if (o) {
          setAddress(getAddress());
        } else {
          setAddress("");
        }
      }}
    >
      <DialogTrigger className="w-full" disabled={disabled}>
        {disabled ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <FakeButton
                  disabled
                  variant={"outline"}
                  type="button"
                  className="w-full"
                >
                  {values.latitude && values.longitude
                    ? `Latitude: ${values.latitude}, Longitude: ${values.longitude}`
                    : "Select Cordinates"}
                </FakeButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>Fill Address, Address Area and City to enable</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button disabled={disabled} variant={"outline"} type="button" className="w-full">
            {values.latitude && values.longitude
              ? `Latitude: ${values.latitude}, Longitude: ${values.longitude}`
              : "Select Cordinates"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent size="2xl">
        <DialogHeader>
          <DialogTitle>Select Cordinates</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <Input defaultValue={address} className="w-full" />
        <iframe
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/MAP_MODE?key=YOUR_API_KEY&q=${"Eiffel+Tower,Paris+France"}`}
          className="w-full aspect-square border-0"
        />
      </DialogContent>
    </Dialog>
  );
};

export default CordinatesInput;
