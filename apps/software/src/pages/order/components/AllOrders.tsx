import OrdersTable from "./OrdersTable"
import SelectFilter from "./SelectFilter"

const AllOrders = () => {
  return (
    <div className="w-full">
      <SelectFilter/>
      <OrdersTable/>
    </div>
  )
}

export default AllOrders