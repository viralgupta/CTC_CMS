import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { parseBalanceToFloat, parseDateToString } from "@/lib/utils";
import { viewOrderMovementIdAtom, ViewOrderType } from "@/store/order";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarIcon,
  CircleUserRound,
  InfoIcon,
  MapPinIcon,
  TruckIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DivButton from "@/components/ui/div-button";
import { useSetRecoilState } from "recoil";
import { viewCustomerIDAtom } from "@/store/Customer";
import { viewArchitectIdAtom } from "@/store/architect";
import { viewCarpenterIdAtom } from "@/store/carpenter";
import { viewAddressIdAtom } from "@/store/address";
import EditOrder from "./EditOrder";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import CreateOrderMovement from "../OrderMovement/CreateMovement";
import LogButton from "@/components/log/LogButton";

const OrderCard = ({ order }: { order: ViewOrderType | null }) => {
  if (!order) return <Skeleton className="w-full h-96" />;
  const setViewCustomerID = useSetRecoilState(viewCustomerIDAtom);
  const setViewArchitectID = useSetRecoilState(viewArchitectIdAtom);
  const setViewCarpenterID = useSetRecoilState(viewCarpenterIdAtom);
  const setViewAddressId = useSetRecoilState(viewAddressIdAtom);

  return (
    <Card className="w-full">
      <CardContent className="p-4 pb-2">
        <div className="flex space-x-2">
          <div className="w-1/2 h-full space-y-1">
            <div className="text-2xl font-bold mb-2 flex justify-between">
              Order Details
              <span className="space-x-2 flex items-center">
                <EditOrder />
                <LogButton value={{type: {"order_id": order.id}}} className="translate-y-0"/>
              </span>
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
              <div className="grid grid-cols-3 gap-2 text-center w-full">
                <div>
                  <div className="p-1">
                    <div className="text-sm font-medium text-gray-500">
                      Total Amount
                    </div>
                    <div className="text-lg font-semibold mt-1">
                      ₹{parseBalanceToFloat(order.total_order_amount)}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="p-1">
                    <div className="text-sm font-medium text-gray-500">
                      Discount
                    </div>
                    <div className="text-lg font-semibold mt-1">
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
                    <div className="text-lg font-semibold mt-1 flex items-center justify-center">
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
                                parseFloat(order.total_order_amount) -
                                parseFloat(order.discount ?? "0.00") -
                                parseFloat(order.amount_paid ?? "0")
                              ).toFixed(2)}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full flex items-start h-32 space-x-1">
              <DivButton
                onClick={() => {
                  setViewAddressId(order.delivery_address_id);
                }}
                className="flex items-start space-x-1 w-1/2 h-full rounded-md overflow-y-scroll hide-scroll"
              >
                <MapPinIcon className="h-12 min-w-10 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Delivery Address</p>
                  {order.delivery_address && (
                    <div className="text-sm h-full hide-scroll">
                      {order.delivery_address?.house_number},&nbsp;
                      {order.delivery_address?.address},&nbsp;
                      {order.delivery_address?.address_area.area}
                    </div>
                  )}
                </div>
              </DivButton>
              <Separator orientation="vertical" />
              <div className="w-1/2 h-full">
                <div className="flex items-center space-x-2 rounded-md h-1/2">
                  <CalendarIcon className="h-10 min-w-10 text-muted-foreground" />
                  <div className="w-full">
                    <p className="font-semibold">Delivery Date</p>
                    <p>{parseDateToString(order.delivery_date)}</p>
                  </div>
                </div>
                <Separator />
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
          <div className="w-1/2 h-full space-y-2">
            <div className="flex items-center h-16 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-1/2 h-full flex items-center justify-center gap-2"
                  >
                    <TruckIcon /> View Deliveries/Return
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end">
                  <CreateOrderMovement/>
                  <OrderMovementTable order_movements={order.order_movements}/>
                </PopoverContent>
              </Popover>
              <DivButton
                onClick={() => {
                  setViewCustomerID(order.customer_id);
                }}
                className="flex items-center space-x-4 w-1/2 h-full"
              >
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
                      {order.customer?.phone_numbers[0].country_code}&nbsp;
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
            </div>
            <div className="flex items-center h-16 gap-2">
              <DivButton
                onClick={() => {
                  setViewArchitectID(order.architect_id);
                }}
                className="flex items-center space-x-4 w-1/2 h-full"
              >
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
              <DivButton
                onClick={() => {
                  setViewCarpenterID(order.carpenter_id);
                }}
                className="flex items-center space-x-4 w-1/2 h-full"
              >
                <Avatar>
                  <AvatarImage src={order.carpenter?.profileUrl ?? undefined} />
                  <AvatarFallback>
                    <CircleUserRound className="w-10 h-10 stroke-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {order.carpenter?.name ?? "No Carpenter Assigned"}
                  </p>
                  {order.carpenter && (
                    <p className="text-sm">
                      Commission: ₹
                      {parseBalanceToFloat(order.carpenter_commision)}
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

const OrderMovementTable = ({
  order_movements,
}: {
  order_movements: ViewOrderType["order_movements"];
}) => {
  const setViewOrderMovementId = useSetRecoilState(viewOrderMovementIdAtom);

  return (
    <Table>
      <TableCaption className="mt-2">Order Movements For this Order!</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className={`text-center`}>Type</TableHead>
          <TableHead className={`text-center`}>Status</TableHead>
          <TableHead className={`text-center`}>Driver Name</TableHead>
          <TableHead className={`text-center`}>Date Created</TableHead>
          <TableHead className={`text-center`}>View Movement</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="max-h-72 overflow-y-scroll hide-scroll">
        {order_movements && order_movements.length > 0 &&
          order_movements.map((order_movement) => {
            return (
              <TableRow key={order_movement.id}>
                <TableCell className={`text-center`}>{order_movement.type}</TableCell>
                <TableCell
                  className={`text-center ${order_movement.delivered ? "text-green-500" : "text-red-500"}`}
                >
                  {order_movement.delivered ? "Delivered" : "Pending"}
                </TableCell>
                <TableCell className={`text-center`}>
                  {order_movement.driver?.name ?? "--"}
                </TableCell>
                <TableCell className={`text-center`}>
                  {parseDateToString(order_movement.created_at)}
                </TableCell>
                <TableCell className={`text-center`}>
                  <Button
                    size={"sm"}
                    onClick={() => {
                      setViewOrderMovementId(order_movement.id);
                    }}
                  >
                    View Movement
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
};

export default OrderCard;
