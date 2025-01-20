import { atom } from "recoil";
import { OrderItem } from "./order";

export interface itemType {
  id: number;
  name: string;
  category: "Adhesives" | "Plywood" | "Laminate" | "Veneer" | "Decorative" | "Moulding" | "Miscellaneous" | "Door";
  quantity: number;
  min_quantity: number;
  sale_rate: number;
  rate_dimension: "Rft" | "sq/ft" | "piece";
};

type viewItemOrderItems = Omit<OrderItem, "item_id">  & {
  order: {
    customer_id: number | null;
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
    id: number;
    vendor_name: string | null;
    ordered_quantity: number | null;
    order_date: Date;
    received_quantity: number | null;
    receive_date: Date | null;
    i_o_w_q: {
      quantity: number;
      warehouse_quantity_id: number;
    }[]
  }[];
  warehouse_quantities: {
    id: number;
    quantity: number;
    warehouse: {
        name: string;
    };
  }[]
}

export interface selectedItemRateType {
  multiplier: number;
  min_rate: number | null;
  sale_rate: number;
  order_items: {
      carpenter_commision: string | null;
      architect_commision: string | null;
      rate: number;
      carpenter_commision_type: "percentage" | "perPiece" | null;
      architect_commision_type: "percentage" | "perPiece" | null;
  }[];
}

export interface selectedItemRateWithCommissionType extends selectedItemRateType {
  architect_rates?: {
    commision: string | null;
    commision_type: "percentage" | "perPiece" | null;
  } | undefined
  carpenter_rates?: {
    commision: string | null,
    commision_type: "percentage" | "perPiece" | null;
  },
}

export const allItemsAtom = atom<itemType[]>({
  key: "allItemsAtom",
  default: []
});

export const viewItemAtom = atom<viewItemType | null>({
  key: "viewItemAtom",
  default: null
});

export const viewItemIDAtom = atom<number | null>({
  key: "viewItemIDAtom",
  default: null
});


export const selectedItemRateAtom = atom<selectedItemRateType | null>({
  key: "selectedItemRateAtom",
  default: null
});