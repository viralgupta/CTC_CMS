import CreateOrder from "./components/CreateOrder";
import OrdersTable from "./components/OrdersTable";
import SelectFilter from "./components/SelectFilter";

const Order = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <CreateOrder/>
      <SelectFilter/>
      <OrdersTable/>
    </div>
  );
};

export default Order;
