import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  CircleUserRound,
  Edit2Icon,
  PhoneIcon,
  Trash2Icon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EditDriver from "./EditDriver";
import { viewDriverAtom, viewDriverIdAtom, ViewDriverType } from "@/store/driver";
import ViewAllPhoneNumbers from "@/components/Inputs/PhoneInput/ViewAllPhoneNo";
import DeleteAlert from "@/components/DeleteAlert";
import LogButton from "@/components/log/logButton";

export default function DriverCard({
  driver,
}: {
  driver: ViewDriverType | null;
}) {
  if (!driver) {
    return (
      <Card className="w-full p-6">
        <Skeleton className="w-full h-40" />
      </Card>
    );
  }

  const primaryPhone = driver.phone_numbers.filter(
    (p) => p.isPrimary == true
  )[0];

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold mb-2 flex items-center space-x-2 relative">
              <Avatar>
                <AvatarImage src={driver.profileUrl ?? ""} />
                <AvatarFallback>
                  <CircleUserRound className="w-full h-full stroke-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <span>{driver.name}</span>
              <span className="absolute right-0">
                <LogButton value={{type: {"driver_id": driver.id}}}/>
              </span>
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                ID: {driver.id}
              </span>
            </div>
            <div className="flex space-x-2 mt-2">
              <EditDriver>
                <Button size="sm" variant="outline">
                  <Edit2Icon className="h-4 w-4 mr-2" />
                  Edit Driver
                </Button>
              </EditDriver>
              <DeleteAlert type="driver" viewObjectAtom={viewDriverAtom} viewObjectIdAtom={viewDriverIdAtom}>
                <Button size="sm" variant="outline">
                  <Trash2Icon className="h-4 w-4 mr-2" />
                  Delete Driver
                </Button>
              </DeleteAlert>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Vehicle Type
              </span>
              <p className="text-md">
                {driver.size_of_vehicle
                  ? `${driver.size_of_vehicle.toUpperCase()}`
                  : "--"}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Vehicle Number
              </span>
              <p className="text-md">
                {driver.vehicle_number
                  ? `${driver.vehicle_number.toUpperCase()}`
                  : "--"}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Primary Phone
              </span>
              <p className="text-md">
                {primaryPhone
                  ? `+${primaryPhone.country_code || ""} ${primaryPhone.phone_number}`
                  : "N/A"}
              </p>
            </div>
            <div>
              <ViewAllPhoneNumbers
                type="driver"
                values={driver.phone_numbers.map((pn) => {
                  return {
                    id: pn.id,
                    country_code: pn.country_code ?? undefined,
                    phone_number: pn.phone_number,
                    whatsappChatId: pn.whatsappChatId ?? undefined,
                    isPrimary: pn.isPrimary ?? undefined,
                  };
                })}
                viewObjectAtom={viewDriverAtom}
                viewObjectIdAtom={viewDriverIdAtom}
              >
                <Button size="sm" variant="outline" className="w-full">
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  View All Phone Numbers
                </Button>
              </ViewAllPhoneNumbers>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}