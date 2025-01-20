import { atom } from "recoil";

export interface viewLogButtonType {
  linked_to?:
    | "ARCHITECT"
    | "CARPANTER"
    | "CUSTOMER"
    | "DRIVER"
    | "ITEM"
    | "ORDER";
  type?: {
    [key in "user_id" | "customer_id" | "architect_id" | "carpenter_id" | "driver_id" | "item_id" | "order_id"]?: string | number;
  };
}

export const viewLogButtonAtom = atom<viewLogButtonType | null>({
  key: "viewLogButtonAtom",
  default: null,
});

export interface viewAllLogType {
  id: number;
  type: "CREATE" | "UPDATE" | "DELETE";
  linked_to: "ARCHITECT" | "CARPANTER" | "CUSTOMER" | "DRIVER" | "ITEM" | "ORDER" | "ITEM_ORDER" | "ORDER_MOVEMENT";
  heading: string | null;
  user: {
    name: string;
  },
  created_at: Date;
}

export const viewAllLogAtom = atom<viewAllLogType[] | null>({
  key: "viewAllLogAtom",
  default: null,
});

export interface viewLogType extends viewAllLogType {
  user_id: number;
  customer_id: number | null;
  architect_id: number | null;
  carpenter_id: number | null;
  driver_id: number | null;
  item_id: number | null;
  order_id: number | null;
  message: string;
}