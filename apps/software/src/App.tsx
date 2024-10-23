import Header from "@/components/header/Header"
import { toast } from "sonner"
import Body from "./components/Body"
import { useRecoilValue } from "recoil"
import tabAtom from "./store/tabs"
import Home from "./pages/home/page"
import Customer from "./pages/customer/page"
import Order from "./pages/order/page"
import Architect from "./pages/architect/page"
import Carpanter from "./pages/carpenter/page"
import Driver from "./pages/driver/page"
import Resources from "./pages/resources/page"
import Address from "./pages/address/page"
import Inventory from "./pages/inventory/page"
import Estimate from "./pages/estimate/page"
import ViewCustomer from "./pages/customer/components/ViewCustomer"
import ViewItem from "./pages/inventory/components/ViewItem/ViewItem"
import ViewAddress from "./pages/address/components/ViewAddress"
import ViewOrder from "./pages/order/components/ViewOrder"
import ViewArchitect from "./pages/architect/components/ViewArchitect"
import ViewCarpenter from "./pages/carpenter/components/ViewCarpenter"
import ViewDriver from "./pages/driver/components/ViewDriver"
import ViewResource from "./pages/resources/components/ViewResource"
import ViewEstimate from "./pages/estimate/components/ViewEstimate"
import ViewPrintOptions from "./components/ViewPrintOption"

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
      <ViewArchitect/>
      <ViewCarpenter/>
      <ViewDriver/>
      <ViewResource/>
      <ViewEstimate/>
      <ViewPrintOptions/>
      <Body>
          {renderTabContent()}
      </Body>
    </div>
  )
}

window.ipcRenderer.on("Error", (_ev, message, desc) => {
  toast.error(message, {
    description: desc ?? undefined
  });
})

export default App