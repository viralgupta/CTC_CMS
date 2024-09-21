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

export interface viewItemType extends itemType {
  multiplier: number;
  min_rate: number | null;
  order_items: Omit<OrderItem, "id" | "total_value">[]
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

export const editItemQuantityIDAtom = atom<string | null>({
  key: "editItemQuantityIDAtom",
  default: null
});

export const editItemIDAtom = atom<string | null>({
  key: "editItemIDAtom",
  default: null
});

export default allItemsAtom;