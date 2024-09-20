import { atom } from "recoil";

export interface itemType {
  id: string;
  name: string;
  category: "Adhesives" | "Plywood" | "Laminate" | "Veneer" | "Decorative" | "Moulding" | "Miscellaneous" | "Door";
  quantity: number;
  min_quantity: number;
  sale_rate: number;
  rate_dimension: "Rft" | "sq/ft" | "piece";
};

const itemAtom = atom<itemType[]>({
  key: "itemAtom",
  default: []
})

export default itemAtom;