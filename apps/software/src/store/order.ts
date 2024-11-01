import { atom } from "recoil";

export enum CommissionType {
  Percentage = "percentage",
  PerPiece = "perPiece",
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_id: string;

  quantity: number;
  rate: number;
  total_value: string;

  carpanter_commision?: string | null;
  carpanter_commision_type?: CommissionType | null;

  architect_commision?: string | null;
  architect_commision_type?: CommissionType | null;

  created_at: Date;
  updated_at: Date;
}

export interface OrderRow {
  id: string;
  priority: "Low" | "High" | "Medium";
  status: "Pending" | "Delivered";
  payment_status: "UnPaid" | "Partial" | "Paid";
  updated_at: Date;
  customer: {
    name: string;
  } | null;
  delivery_address: {
    house_number: string;
    address: string;
  } | null;
}

export type allOrdersType = {
  "Status-Pending": OrderRow[];
  "Status-Delivered": OrderRow[];
  "Priority-High": OrderRow[];
  "Priority-Medium": OrderRow[];
  "Priority-Low": OrderRow[];
  "Payment-UnPaid": OrderRow[];
  "Payment-Partial": OrderRow[];
  "Payment-Paid": OrderRow[];
  All: OrderRow[];
};

export const defaultAllOrders: allOrdersType = {
  "Status-Pending": [],
  "Status-Delivered": [],
  "Priority-High": [],
  "Priority-Medium": [],
  "Priority-Low": [],
  "Payment-UnPaid": [],
  "Payment-Partial": [],
  "Payment-Paid": [],
  All: [],
};

export const allOrdersAtom = atom<allOrdersType>({
  key: "allOrdersAtom",
  default: defaultAllOrders,
});

export const currentFilterAtom = atom<keyof allOrdersType>({
  key: "currentFilterAtom",
  default: "All",
});

export type ViewOrderType = {
  status: "Pending" | "Delivered";
  id: string;
  customer_id: string | null;
  priority: "Low" | "High" | "Medium";
  architect_id: string | null;
  carpanter_id: string | null;
  note: string | null;
  payment_status: "UnPaid" | "Partial" | "Paid";
  delivery_date: Date | null;
  delivery_address_id: string | null;
  total_order_amount: string;
  discount: string | null;
  amount_paid: string | null;
  carpanter_commision: string | null;
  architect_commision: string | null;
  created_at: Date;
  updated_at: Date;
  customer: {
    name: string;
    id: string;
    profileUrl: string | null;
    balance: string | null;
    phone_numbers: {
      phone_number: string;
      country_code: string | null;
    }[];
  } | null;
  architect:
    | {
        name: string;
        profileUrl: string | null;
      }
    | null
    | undefined;
  carpanter:
    | {
        name: string;
        profileUrl: string | null;
      }
    | null
    | undefined;
  delivery_address:
    | {
        address: string;
        house_number: string;
        address_area: {
          area: string;
        };
      }
    | null
    | undefined;
  order_items:
    | {
        id: string;
        carpanter_commision: string | null;
        architect_commision: string | null;
        quantity: number;
        delivered_quantity: number;
        rate: number;
        total_value: string;
        carpanter_commision_type: "percentage" | "perPiece" | null;
        architect_commision_type: "percentage" | "perPiece" | null;
        item_id: string;
        item:
          | {
              name: string;
              rate_dimension: "Rft" | "sq/ft" | "piece";
            }
          | undefined;
      }[]
    | undefined;
  order_movements:
    | {
        id: string;
        driver_id: string | null;
        status: "Pending" | "Completed";
        created_at: Date;
        type: "DELIVERY" | "RETURN";
        driver: {
          name: string;
        } | null;
      }[]
    | undefined;
};

export const viewOrderAtom = atom<null | ViewOrderType>({
  key: "viewOrderAtom",
  default: null,
});

export const viewOrderIdAtom = atom<string | null>({
  key: "viewOrderIdAtom",
  default: null,
});

export const viewOrderMovementIdAtom = atom<string | null>({
  key: "viewOrderMovementIdAtom",
  default: null,
});
