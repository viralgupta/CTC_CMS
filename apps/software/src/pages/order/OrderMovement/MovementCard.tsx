import { viewMovementType } from "./OrderMovement";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { parseDateToString } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarIcon,
  CircleUserRound,
  MapPinIcon,
  ReceiptText,
} from "lucide-react";
import DivButton from "@/components/ui/div-button";
import { Separator } from "@/components/ui/separator";
import { useSetRecoilState } from "recoil";
import { viewAddressIdAtom } from "@/store/address";
import { viewCustomerIDAtom } from "@/store/customer";
import { viewDriverIdAtom } from "@/store/driver";
import { Button } from "@/components/ui/button";
import EditMovement from "./Edit/EditMovement";
import DeleteMovement from "./Edit/DeleteMovement";
import ChangeStatus from "./Edit/ChangeStatus";
import printInfoAtom from "@/store/print";

const MovementCard = ({ movement }: { movement: viewMovementType | null }) => {
  if (!movement) return <Skeleton className="w-full h-44" />;

  const setViewAddressId = useSetRecoilState(viewAddressIdAtom);
  const setViewCustomerId = useSetRecoilState(viewCustomerIDAtom);
  const setViewDriverId = useSetRecoilState(viewDriverIdAtom);
  const setPrintInfo = useSetRecoilState(printInfoAtom);

  
  function setPrint() {
    setPrintInfo({
      printType: "orderMovement",
      type: movement?.type == "DELIVERY" ? "Delivery" : "Return",
      createdAt: parseDateToString(new Date()),
      deliveredAt: parseDateToString(movement?.delivery_at ?? null),
      customer: {
        name: movement?.order?.customer?.name ?? "",
        address:
          (movement?.order?.delivery_address?.house_number ?? "") +
          (movement?.order?.delivery_address?.address
            ? `, ${movement?.order?.delivery_address?.address}`
            : "") +
          (movement?.order?.delivery_address?.address_area.area
            ? `, ${movement?.order?.delivery_address?.address_area.area}`
            : ""),
      },
      order_movement_items: (movement?.order_movement_items?.map((omi) => {
        return {
          name: omi.order_item.item.name,
          quantity: omi.quantity.toString()
        }
      }) ?? [])
    });
  }

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex space-x-2">
            <div className="w-1/2 h-full space-y-1">
              <div className="text-2xl font-bold mb-2 flex justify-between">
                Order Movement Details
              </div>
              <div className="w-full flex items-start h-32 space-x-1">
                <div className="w-1/2 h-full">
                  <DivButton
                    onClick={() => {
                      if(movement?.order?.delivery_address){
                        setViewAddressId(movement?.order?.delivery_address?.id);
                      }
                    }}
                    className="flex items-start space-x-1 h-1/2 rounded-md overflow-y-scroll hide-scroll"
                  >
                    <MapPinIcon className="h-12 min-w-10 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">Delivery Address</p>
                      {movement.order?.delivery_address && (
                        <div className="text-sm h-full hide-scroll">
                          {movement.order?.delivery_address?.house_number}
                          {movement.order?.delivery_address?.address ? `, ${movement.order?.delivery_address?.address}` : ""}
                          {movement.order?.delivery_address?.address_area.area ? `, ${movement.order?.delivery_address?.address_area.area}` : ""}
                        </div>
                      )}
                    </div>
                  </DivButton>
                  <Separator />
                  <DivButton
                    onClick={() => {}}
                    className="flex items-center space-x-1 h-1/2 rounded-md overflow-y-scroll hide-scroll"
                  >
                    <ReceiptText className="h-12 min-w-10 text-muted-foreground" />
                    <div>View Uploaded Recipt</div>
                  </DivButton>
                </div>
                <Separator orientation="vertical" />
                <div className="w-1/2 h-full">
                  <div className="flex items-center space-x-2 rounded-md h-1/2">
                    <CalendarIcon className="h-10 min-w-10 text-muted-foreground" />
                    <div className="w-full">
                      <p className="font-semibold">Created At:</p>
                      <p>{parseDateToString(movement.created_at)}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center space-x-2 rounded-md h-1/2">
                    <CalendarIcon className="h-10 min-w-10 text-muted-foreground" />
                    <div className="w-full">
                      <p className="font-semibold">
                        {movement.type == "DELIVERY" ? "Delivery" : "Return"}{" "}
                        Date
                      </p>
                      <p>{parseDateToString(movement.delivery_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-1/2 h-full space-y-2">
              <div className="w-full h-24 border border-border rounded-md p-1 flex items-center">
                <div className="grid grid-cols-3 gap-2 text-center w-full">
                  <div className="p-1">
                    <div className="text-sm font-medium text-gray-500">
                      TYPE:
                    </div>
                    <div className="text-lg font-semibold mt-2">
                      {movement.type}
                    </div>
                  </div>
                  <div className="p-1">
                    <div className={`text-sm font-medium text-gray-500`}>
                      STATUS:
                    </div>
                    <div
                      className={`text-lg font-semibold mt-2 ${movement.status == "Pending" ? "text-red-500" : "text-green-500"}`}
                    >
                      {movement.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="p-1">
                    <div className="text-sm font-medium text-gray-500">
                      Labour and Frate:
                    </div>
                    <div className="text-lg font-semibold mt-2">
                      ₹{movement.labour_frate_cost.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center h-16 gap-2">
                <DivButton
                  onClick={() => {
                    if(movement.order?.customer){
                      setViewCustomerId(movement.order?.customer?.id);
                    }
                  }}
                  className="flex items-center space-x-4 w-1/2 h-full"
                >
                  <Avatar>
                    <AvatarImage
                      src={movement.order?.customer?.profileUrl ?? undefined}
                    />
                    <AvatarFallback>
                      <CircleUserRound className="w-10 h-10 stroke-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {movement.order?.customer?.name ?? "No Customer Assigned"}
                    </p>
                  </div>
                </DivButton>
                <DivButton
                  onClick={() => {
                    setViewDriverId(movement.driver_id);
                  }}
                  className="flex items-center space-x-4 w-1/2 h-full"
                >
                  <Avatar>
                    <AvatarImage
                      src={movement.driver?.profileUrl ?? undefined}
                    />
                    <AvatarFallback>
                      <CircleUserRound className="w-10 h-10 stroke-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">
                      {movement.driver?.name ?? "No Driver Assigned"}
                    </div>
                    {movement.driver && (
                      <div className="text-sm">
                        {movement.driver?.vehicle_number ?? "--"}
                      </div>
                    )}
                  </div>
                </DivButton>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex gap-2 mt-2">
        <EditMovement orderMovement={movement}>
          <Button className="w-full" variant={"outline"}>
            Edit Movement
          </Button>
        </EditMovement>
        <DeleteMovement>
          <Button className="w-full" variant={"outline"}>
            Delete Movement
          </Button>
        </DeleteMovement>
        <ChangeStatus orderMovement={movement} />
        <Button className="w-full" variant={"outline"} onClick={setPrint}>
          Print Recipt
        </Button>
        <Button className="w-full" variant={"outline"}>
          Upload Signed Recipt
        </Button>
      </div>
    </div>
  );
};

export default MovementCard;
