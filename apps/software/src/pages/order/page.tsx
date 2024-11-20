import AllOrders from "./components/AllOrders";
import CreateOrder from "./components/CreateOrder";

const Order = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <CreateOrder/>
      <AllOrders/>
    </div>
  );
};

export default Order;
