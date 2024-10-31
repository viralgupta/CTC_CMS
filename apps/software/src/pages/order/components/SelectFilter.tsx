import { useAllOrders } from "@/hooks/orders";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import RefetchButton from "@/components/RefetchButton";
import { allOrdersType } from "@/store/order";
import LogButton from "@/components/log/logButton";

const SelectFilter = () => {
  const { filter, setFilter, refetchOrders } = useAllOrders();

  const filterToName = () => {
    switch (filter) {
      case "Status-Pending":
        return "Delivery Pending";
      case "Status-Delivered":
        return "Delivered";
      case "Payment-UnPaid":
        return "Payment UnPaid";
      case "Payment-Partial":
        return "Payment Partial";
      case "Payment-Paid":
        return "Payment Paid";
      case "Priority-High":
        return "Priority High";
      case "Priority-Medium":
        return "Priority Medium";
      case "Priority-Low":
        return "Priority Low";
      case "All":
        return "All";
    }
  };

  return (
    <div className="w-full mb-4 space-y-4">
      <div className="flex">
        <Button
          variant={"outline"}
          onClick={() => setFilter("All")}
          className={`${filter == "All" ? "border-primary" : ""}`}
        >
          All
        </Button>
        <SelectStatus value={filter} onChange={setFilter} />
        <SelectPriority value={filter} onChange={setFilter} />
        <SelectPaymentStatus value={filter} onChange={setFilter} />
      </div>
      <div className="flex items-center text-3xl font-cubano justify-between">
        <div>
          Current&nbsp;Filter:&nbsp;
          <span className="font-sofiapro text-primary/100">
            {filterToName()}
          </span>
        </div>
        <div className="flex gap-2">
          <RefetchButton
            className="w-8"
            description="Refresh Orders"
            refetchFunction={refetchOrders}
            />
            <LogButton value={{linked_to: "ORDER"}}/>
        </div>
      </div>
    </div>
  );
};

export const SelectStatus = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: keyof allOrdersType) => void;
}) => {
  return (
    <Select
      value={
        value == "Status-Pending" || value == "Status-Delivered" ? value : ""
      }
      onValueChange={(val: "Status-Pending" | "Status-Delivered") =>
        onChange(val)
      }
    >
      <SelectTrigger
        className={`mx-1 ${value == "Status-Pending" || value == "Status-Delivered" ? "border-primary" : ""}`}
      >
        <SelectValue placeholder="Delivery Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Status-Pending">Pending</SelectItem>
        <SelectItem value="Status-Delivered">Delivered</SelectItem>
      </SelectContent>
    </Select>
  );
};
export const SelectPriority = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: keyof allOrdersType) => void;
}) => {
  return (
    <Select
      value={
        value == "Priority-High" ||
        value == "Priority-Medium" ||
        value == "Priority-Low"
          ? value
          : ""
      }
      onValueChange={(
        val: "Priority-High" | "Priority-Medium" | "Priority-Low"
      ) => onChange(val)}
    >
      <SelectTrigger
        className={`mx-1 ${
          value == "Priority-High" ||
          value == "Priority-Medium" ||
          value == "Priority-Low"
            ? "border-primary"
            : ""
        }`}
      >
        <SelectValue placeholder="Priority" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Priority-High">High</SelectItem>
        <SelectItem value="Priority-Medium">Medium</SelectItem>
        <SelectItem value="Priority-Low">Low</SelectItem>
      </SelectContent>
    </Select>
  );
};
export const SelectPaymentStatus = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: keyof allOrdersType) => void;
}) => {
  return (
    <Select
      value={
        value == "Payment-UnPaid" ||
        value == "Payment-Partial" ||
        value == "Payment-Paid"
          ? value
          : ""
      }
      onValueChange={(
        val: "Payment-UnPaid" | "Payment-Partial" | "Payment-Paid"
      ) => onChange(val)}
    >
      <SelectTrigger
        className={`mx-1 ${
          value == "Payment-UnPaid" ||
          value == "Payment-Partial" ||
          value == "Payment-Paid"
            ? "border-primary"
            : ""
        }`}
      >
        <SelectValue placeholder="Payment" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Payment-UnPaid">Un Paid</SelectItem>
        <SelectItem value="Payment-Partial">Partial</SelectItem>
        <SelectItem value="Payment-Paid">Paid</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SelectFilter;
