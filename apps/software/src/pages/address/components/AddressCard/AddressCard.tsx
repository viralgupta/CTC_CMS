import { Skeleton } from "@/components/ui/skeleton";
import {
  viewAddressAtom,
  viewAddressIdAtom,
  ViewAddressType,
} from "@/store/address";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { AdvancedMarker, Map } from "@vis.gl/react-google-maps";
import { Edit2Icon, MapPin, Trash2Icon, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSetRecoilState } from "recoil";
import { viewCustomerIDAtom } from "@/store/Customer";
import DeleteAddress from "./DeleteAddress";
import EditAddress from "./EditAddress";

const AddressCard = ({ address }: { address: ViewAddressType | null }) => {
  const setViewCustomerId = useSetRecoilState(viewCustomerIDAtom);
  const setViewAddressId = useSetRecoilState(viewAddressIdAtom);
  const setViewAddress = useSetRecoilState(viewAddressAtom);

  if (!address) return <Skeleton className="w-full h-96" />;
  return (
    <Card className="w-full">
      <CardContent className="p-6 flex">
        <div className="w-2/3">
          <CardTitle className="mb-2">
            {address.customer.name} 's Address
          </CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                House Number
              </span>
              <p>{address.house_number || "N/A"}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Address
              </span>
              <p className="text-md">
                {address.address ? `${address.address}` : "N/A"}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Area
              </span>
              <p className="text-md">{address.address_area.area}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                City
              </span>
              <p className="text-md">{address.city}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                State
              </span>
              <p className="text-md">{address.state}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Is Primary
              </span>
              <p className="text-md">{address.isPrimary ? "True" : "False"}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Latitude
              </span>
              <p className="text-md">{address.latitude ?? "N/A"}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Longitude
              </span>
              <p className="text-md">{address.longitude ?? "N/A"}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 pr-4">
            <Button
              variant={"outline"}
              onClick={() => {
                setViewCustomerId(address.customer.id);
              }}
            >
              <UserRound className="h-4 w-4 mr-2" />
              View Customer
            </Button>
            <EditAddress
              address={{
                address_id: address.id,
                customer_id: address.customer.id,
                house_number: address.house_number,
                address: address.address,
                address_area_id: address.address_area.id,
                city: address.city,
                state: address.state,
                isPrimary: address.isPrimary ?? false,
                cordinates: {
                  latitude: address.latitude ?? undefined,
                  longitude: address.longitude ?? undefined,
                },
              }}
            >
              <Button variant={"outline"} onClick={() => {}}>
                <Edit2Icon className="h-4 w-4 mr-2" />
                Edit Address
              </Button>
            </EditAddress>
            <DeleteAddress
              addressId={address.id}
              resetViewCustomer={false}
              onDelete={() => {
                setViewAddressId(null);
                setViewAddress(null);
              }}
            >
              <Button variant={"outline"} onClick={() => {}}>
                <Trash2Icon className="h-4 w-4 mr-2" />
                Delete Address
              </Button>
            </DeleteAddress>
          </div>
        </div>
        <div className="w-1/3">
          {address.latitude && address.longitude ? (
            <Map
              id="map"
              mapId={"8d0a820dd0d59a20"}
              defaultZoom={15}
              defaultCenter={{
                lat: address.latitude,
                lng: address.longitude,
              }}
              clickableIcons={false}
              className="w-full aspect-square"
            >
              <AdvancedMarker
                position={{
                  lat: address.latitude,
                  lng: address.longitude,
                }}
              />
            </Map>
          ) : (
            <div className="w-full aspect-square rounded-md bg-muted relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AddressCard;
