import { atom } from "recoil";

interface printEstimateType {
  printType: "estimate";
  customerName: string;
  date: string;
  estimate_items: {
    name: string;
    rate: string;
    quantity: string;
    total: string;
  }[];
  totalEstimateCost: string;
}

interface printOrderMovementType {
  printType: "orderMovement";
  type: "Delivery" | "Return";
  createdAt: string;
  deliveredAt: string;
  customer: {
    name: string;
    address: string;
  };
  order_movement_items: {
    name: string;
    quantity: string;
  }[];
}

const printInfoAtom = atom<printEstimateType | printOrderMovementType | null>({
  key: "printInfoAtom",
  default: null,
  effects: [({onSet, setSelf}) => {
    onSet((info) => {
      if(!info) {
        window.ipcRenderer.invoke("cancel-print");
        return;
      } else {
        window.ipcRenderer.invoke("print-preview", info, info.printType)
      }
    });
    window.ipcRenderer.on("print-cancelled", () => {
      setSelf(null);
    })
  }]
})

export default printInfoAtom;