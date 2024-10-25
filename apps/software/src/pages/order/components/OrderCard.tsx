import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { parseBalanceToFloat, parseDateToString } from "@/lib/utils";
import { ViewOrderType } from "@/store/order";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarIcon,
  CircleUserRound,
  InfoIcon,
  MapPinIcon,
  TruckIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DivButton from "@/components/ui/div-button";
import { useSetRecoilState } from "recoil";
import { viewCustomerIDAtom } from "@/store/Customer";
import { viewArchitectIdAtom } from "@/store/architect";
import { viewDriverIdAtom } from "@/store/driver";
import { viewCarpenterIdAtom } from "@/store/carpenter";
import { viewAddressIdAtom } from "@/store/address";
import EditOrder from "./EditOrder";
import { Separator } from "@/components/ui/separator";

const OrderCard = ({ order }: { order: ViewOrderType | null }) => {
  if (!order) return <Skeleton className="w-full h-96" />;
  const setViewCustomerID = useSetRecoilState(viewCustomerIDAtom);
  const setViewDriverID = useSetRecoilState(viewDriverIdAtom);
  const setViewArchitectID = useSetRecoilState(viewArchitectIdAtom);
  const setViewCarpenterID = useSetRecoilState(viewCarpenterIdAtom);
  const setViewAddressId = useSetRecoilState(viewAddressIdAtom);

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex space-x-2">
          <div className="w-1/2 h-full space-y-1">
            <div className="text-2xl font-bold mb-2 flex justify-between">
              Order Details
              <EditOrder/>
            </div>
            <div className="w-full h-24 border border-border rounded-md p-1">
              <div className="flex items-center justify-around space-x-2 pb-1">
                <span className="w-1/3 text-sm text-center">
                  Priority:&nbsp;
                  <span
                    className={`font-cubano ${
                      order.priority == "High"
                        ? "text-red-500"
                        : order.priority == "Medium"
                          ? "text-yellow-500"
                          : "text-green-500"
                    }`}
                  >
                    {order.priority}
                  </span>
                </span>
                <span className="w-1/3 text-sm text-center">
                  Delivery:&nbsp;
                  <span
                    className={`font-cubano ${
                      order.status == "Pending"
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {order.status}
                  </span>
                </span>
                <span className="w-1/3 text-sm text-center">
                  Payment:&nbsp;
                  <span
                    className={`font-cubano ${
                      order.payment_status == "UnPaid"
                        ? "text-red-500"
                        : order.payment_status == "Partial"
                          ? "text-yellow-500"
                          : "text-green-500"
                    }`}
                  >
                    {order.payment_status}
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center w-full">
                <div>
                  <div className="p-1">
                    <div className="text-sm font-medium text-gray-500">
                      Total Amount
                    </div>
                    <div className="text-lg font-semibold mt-2">
                      ₹{parseBalanceToFloat(order.total_order_amount)}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="p-1">
                    <div className="text-sm font-medium text-gray-500">
                      Discount
                    </div>
                    <div className="text-lg font-semibold mt-2">
                      {order.discount
                        ? `₹${parseBalanceToFloat(order.discount)}`
                        : "--"}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="p-1">
                    <div className="text-sm font-medium text-gray-500">
                      Amount Paid
                    </div>
                    <div className="text-lg font-semibold mt-2 flex items-center">
                      {order.amount_paid ? `₹${order.amount_paid}` : "--"}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoIcon className="h-5 w-5 ml-2 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Balance: ₹
                              {(
                                parseFloat(order.total_order_amount) - parseFloat(order.discount ?? "0.00") -
                                parseFloat(order.amount_paid ?? "0")
                              ).toFixed(2)}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="p-1">
                    <div className="text-sm font-medium text-gray-500">
                      Labour & Frate
                    </div>
                    <div className="text-lg font-semibold mt-2">
                      ₹{order.labour_frate_cost.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full flex items-start h-32 space-x-1">
              <DivButton onClick={() => {setViewAddressId(order.delivery_address_id ?? '')}} className="flex items-start space-x-1 w-1/2 h-full rounded-md overflow-y-scroll hide-scroll">
                <MapPinIcon className="h-12 min-w-10 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Delivery Address</p>
                  {order.delivery_address && <div className="text-sm h-full hide-scroll">
                    {order.delivery_address?.house_number},&nbsp;
                    {order.delivery_address?.address},&nbsp;
                    {order.delivery_address?.address_area.area}
                  </div>}
                </div>
              </DivButton>
              <Separator orientation="vertical"/>
              <div className="w-1/2 h-full">
                <div className="flex items-center space-x-2 rounded-md h-1/2">
                  <CalendarIcon className="h-10 min-w-10 text-muted-foreground" />
                  <div className="w-full">
                    <p className="font-semibold">Delivery Date</p>
                    <p>{parseDateToString(order.delivery_date)}</p>
                  </div>
                </div>
                <Separator/>
                <div className="flex items-center space-x-2 rounded-md h-1/2">
                  <div className="w-full text-center">
                    <p className="text-sm">
                      Created At: {parseDateToString(order.created_at)}
                    </p>
                    <p className="text-sm">
                      Updated At: {parseDateToString(order.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-1/2 h-full space-y-4">
            <div className="flex items-center">
              <DivButton onClick={() => {setViewCustomerID(order.customer_id ?? '')}} className="flex items-center space-x-4 w-1/2">
                <Avatar>
                  <AvatarImage src={order.customer?.profileUrl ?? undefined} />
                  <AvatarFallback>
                    <CircleUserRound className="w-10 h-10 stroke-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {order.customer?.name ?? "No Customer Assigned"}
                  </p>
                  {order.customer && (
                    <p className="text-sm text-muted-foreground">
                      {order.customer?.phone_numbers[0].country_code}{" "}
                      {order.customer?.phone_numbers[0].phone_number}
                    </p>
                  )}
                  {order.customer && (
                    <p className="text-sm">
                      Balance: ₹{order.customer?.balance ?? "0.00"}
                    </p>
                  )}
                </div>
              </DivButton>
              <DivButton onClick={() => {setViewDriverID(order.driver_id ?? '')}} className="flex items-center space-x-4 w-1/2">
                <TruckIcon className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="font-semibold">
                    {order.driver?.name ?? "No Driver Assigned"}
                  </p>
                  {order.driver && (
                    <p className="text-sm text-muted-foreground">
                      {order.driver?.phone_numbers[0].country_code}&nbsp;
                      {order.driver?.phone_numbers[0].phone_number}
                    </p>
                  )}
                  {order.driver && (
                    <p className="text-sm">
                      {order.driver?.vehicle_number ?? "--"}
                    </p>
                  )}
                </div>
              </DivButton>
            </div>
            <div className="flex items-center">
              <DivButton onClick={() => {setViewArchitectID(order.architect_id ?? '')}} className="flex items-center space-x-4 w-1/2">
                <Avatar>
                  <AvatarImage src={order.architect?.profileUrl ?? undefined} />
                  <AvatarFallback>
                    <CircleUserRound className="w-10 h-10 stroke-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {order.architect?.name ?? "No Architect Assigned"}
                  </p>
                  {order.architect && (
                    <p className="text-sm">
                      Commission: ₹
                      {parseBalanceToFloat(order.architect_commision)}
                    </p>
                  )}
                </div>
              </DivButton>
              <DivButton onClick={() => {setViewCarpenterID(order.carpanter_id ?? '')}} className="flex items-center space-x-4 w-1/2">
                <Avatar>
                  <AvatarImage src={order.carpanter?.profileUrl ?? undefined} />
                  <AvatarFallback>
                    <CircleUserRound className="w-10 h-10 stroke-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {order.carpanter?.name ?? "No Carpenter Assigned"}
                  </p>
                  {order.carpanter && (
                    <p className="text-sm">
                      Commission: ₹
                      {parseBalanceToFloat(order.carpanter_commision)}
                    </p>
                  )}
                </div>
              </DivButton>
            </div>
            <div className="w-full h-32 rounded-md border border-border overflow-y-scroll hide-scroll p-1">
              <h3 className="font-semibold">Order Note</h3>
              <p className="w-full h-full">{order.note}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
