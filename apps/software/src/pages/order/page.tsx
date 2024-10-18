import AllOrders from "./components/AllOrders";
import CreateOrder from "./components/CreateOrder";

const Order = () => {
  return (
    <div className="w-full h-full">
      <CreateOrder/>
      <div className="w-full h-full space-y-8">
        <AllOrders/>
        <div>&nbsp;</div>
        <div>&nbsp;</div>
      </div>
    </div>
  );
};

export default Order;
