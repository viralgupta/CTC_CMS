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
import { setDebouncedValue } from "@/lib/utils";
import {
  AdvancedMarker,
  Map,
  useMap,
  useMapsLibrary,
  type MapCameraChangedEvent,
} from "@vis.gl/react-google-maps";
import { useTheme } from "next-themes";
import React from "react";
import { toast } from "sonner";

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
  const { resolvedTheme } = useTheme();
  const geocodingLib = useMapsLibrary("geocoding");
  const map = useMap("map");
  const [address, setAddress] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [cordinates, setCordinates] = React.useState({
    lat: values.latitude,
    lng: values.longitude,
  });

  function handleOnCenterChange(event: MapCameraChangedEvent) {
    const lat = event.map.getCenter()?.lat();
    const lng = event.map.getCenter()?.lng();
    if (lat && lng) {
      setCordinates({
        lat: lat,
        lng: lng,
      });
    }
  }

  async function calculateCordinatesFromAddress(address: string) {
    if (!geocodingLib) {
      toast.info("Could not get cordinates for given address");
      return null;
    } else {
      const geoCoder = new geocodingLib.Geocoder();
      const results = await geoCoder.geocode({
        address: address,
        region: "IN",
      });
      const lat = results.results[0].geometry.location.lat() ?? null;
      const lng = results.results[0].geometry.location.lng() ?? null;
      if (lat && lng) {
        setCordinates({
          lat: lat,
          lng: lng,
        });
        if (map) {
          map.setCenter({ lat: lat, lng: lng });
          map.setZoom(15);
        }
      }
    }
  }

  React.useEffect(() => {
    if (!address || !open) return;
    calculateCordinatesFromAddress(address);
  }, [address]);

  return (
    <Dialog
      open={open}
      onOpenChange={async (o) => {
        setOpen(o);
        if (o) {
          requestAnimationFrame(() => {
            setAddress(getAddress());
            calculateCordinatesFromAddress(getAddress());
          });
        } else {
          setAddress("");
        }
      }}
    >
      <DialogTrigger className="w-full" disabled={disabled} asChild={!disabled}>
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
                  Select Cordinates
                </FakeButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>Fill Address, Address Area and City to enable</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="w-full flex space-x-2 items-center">
            <Button variant={"outline"} type="button">
              {values.latitude ? <p>Select New Cordinates</p> : <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Select Cordinates&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>}
            </Button>
            {values.latitude !== null && values.latitude !== 0 && (
              <p className="text-xs text-start mt-1 text-muted-foreground">
                Lat: {values.latitude}
                <br />
                Lng: {values.longitude}
              </p>
            )}
          </div>
        )}
      </DialogTrigger>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle>Select Cordinates</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <div className="flex space-x-2">
          <Input
            defaultValue={address}
            onChange={(e) =>
              setDebouncedValue({
                key: "cordinatesInput",
                value: e.target.value,
                setFunction: setAddress,
              })
            }
            className="w-full"
          />
          <Button
            type="button"
            disabled={cordinates.lat ? false : true}
            onClick={() => {
              onCordinateSelect(cordinates.lat, cordinates.lng);
              setOpen(false);
            }}
          >
            Confirm Cordinates
          </Button>
        </div>
        <Map
          id="map"
          mapId={"8d0a820dd0d59a20"}
          colorScheme={resolvedTheme == "dark" ? "DARK" : "LIGHT"}
          defaultZoom={15}
          defaultCenter={cordinates}
          clickableIcons={false}
          onCenterChanged={handleOnCenterChange}
          className="w-full aspect-square"
        >
          <AdvancedMarker position={cordinates} />
        </Map>
      </DialogContent>
    </Dialog>
  );
};

export default CordinatesInput;
