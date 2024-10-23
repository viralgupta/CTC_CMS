import { atom } from "recoil";

interface printEstimateType {
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

const printInfoAtom = atom<printEstimateType | null>({
  key: "printInfoAtom",
  default: null,
  effects: [({onSet, setSelf}) => {
    onSet((info) => {
      if(!info) {
        window.ipcRenderer.invoke("cancel-print");
        return;
      } else {
        window.ipcRenderer.invoke("print-preview", info, "estimate")
      }
    });
    window.ipcRenderer.on("print-cancelled", () => {
      setSelf(null);
    })
  }]
})

export default printInfoAtom;