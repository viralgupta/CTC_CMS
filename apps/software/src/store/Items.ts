import { atom } from "recoil";
import { OrderItem } from "./order";

export interface itemType {
  id: string;
  name: string;
  category: "Adhesives" | "Plywood" | "Laminate" | "Veneer" | "Decorative" | "Moulding" | "Miscellaneous" | "Door";
  quantity: number;
  min_quantity: number;
  sale_rate: number;
  rate_dimension: "Rft" | "sq/ft" | "piece";
};

type viewItemOrderItems = Omit<OrderItem, "item_id">  & {
  order: {
    customer_id: string | null;
    customer: {
      name: string;
    } | null;
  };
}

export interface viewItemType extends itemType {
  multiplier: number;
  min_rate: number | null;
  order_items: viewItemOrderItems[];
}

const allItemsAtom = atom<itemType[]>({
  key: "allItemsAtom",
  default: []
});

export const viewItemAtom = atom<viewItemType | null>({
  key: "viewItemAtom",
  default: null
});

export const viewItemIDAtom = atom<string | null>({
  key: "viewItemIDAtom",
  default: null
});

export default allItemsAtom;