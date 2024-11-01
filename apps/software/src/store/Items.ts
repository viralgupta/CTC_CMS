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
  item_orders: {
    id: string;
    vendor_name: string | null;
    ordered_quantity: number | null;
    order_date: Date;
    received_quantity: number | null;
    receive_date: Date | null;
  }[];
}

export interface selectedItemRateType {
  multiplier: number;
  min_rate: number | null;
  sale_rate: number;
  order_items: {
      carpanter_commision: string | null;
      architect_commision: string | null;
      rate: number;
      carpanter_commision_type: "percentage" | "perPiece" | null;
      architect_commision_type: "percentage" | "perPiece" | null;
  }[];
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


export const selectedItemRateAtom = atom<selectedItemRateType | null>({
  key: "selectedItemRateAtom",
  default: null
});

export default allItemsAtom;