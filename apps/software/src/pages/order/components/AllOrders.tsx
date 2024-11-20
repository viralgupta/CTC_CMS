import OrdersTable from "./OrdersTable"
import SelectFilter from "./SelectFilter"

const AllOrders = () => {
  return (
    <div className="w-full flex-1 flex flex-col">
      <SelectFilter/>
      <OrdersTable/>
    </div>
  )
}

export default AllOrders