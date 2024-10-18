import Header from "@/components/header/Header"
import { toast } from "sonner"
import Body from "./components/Body"
import { useRecoilValue } from "recoil"
import tabAtom from "./store/tabs"
import Home from "./pages/home/page"
import Customer from "./pages/customer/page"
import Order from "./pages/order/page"
import Architect from "./pages/architect/page"
import Carpanter from "./pages/carpanter/page"
import Driver from "./pages/driver/page"
import Resources from "./pages/resources/page"
import Address from "./pages/address/page"
import Inventory from "./pages/inventory/page"
import Estimate from "./pages/estimate/page"
import ViewCustomer from "./pages/customer/components/ViewCustomer"
import ViewItem from "./pages/inventory/components/ViewItem/ViewItem"
import ViewAddress from "./pages/address/components/ViewAddress"
import ViewOrder from "./pages/order/components/ViewOrder"

function App() {
  const tab = useRecoilValue(tabAtom);

  const renderTabContent = () => {
    switch (tab) {
      case "home":
        return <Home/>;
      case "customer":
        return <Customer/>;
      case "order":
        return <Order/>;
      case "estimate":
        return <Estimate/>;
      case "address":
        return <Address/>;
      case "inventory":
        return <Inventory/>;
      case "architect":
        return <Architect/>;
      case "carpanter":
        return <Carpanter/>;
      case "driver":
        return <Driver/>;
      case "resources":
        return <Resources/>;
      default:
        return <Home/>;
    }
  };

  return (
    <div className='w-full h-full'>
      <Header/>
      <ViewCustomer/>
      <ViewItem/>
      <ViewAddress/>
      <ViewOrder/>
      <Body>
          {renderTabContent()}
      </Body>
    </div>
  )
}

window.ipcRenderer.on("Error", (_ev, args) => {
  toast.error(args)
})

export default App