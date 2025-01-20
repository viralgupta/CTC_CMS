import { atom } from "recoil";

export enum CommissionType {
  Percentage = "percentage",
  PerPiece = "perPiece",
}

export interface OrderItem {
  id: number;
  order_id: number;
  item_id: number;

  quantity: number;
  rate: number;
  total_value: string;

  carpenter_commision?: string | null;
  carpenter_commision_type?: CommissionType | null;

  architect_commision?: string | null;
  architect_commision_type?: CommissionType | null;

  created_at: Date;
  updated_at: Date;
}

export interface OrderRow {
  id: number;
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
  id: number;
  status: "Pending" | "Delivered";
  customer_id: number | null;
  priority: "Low" | "High" | "Medium";
  architect_id: number | null;
  carpenter_id: number | null;
  note: string | null;
  payment_status: "UnPaid" | "Partial" | "Paid";
  delivery_date: Date | null;
  delivery_address_id: number | null;
  total_order_amount: string;
  discount: string | null;
  amount_paid: string | null;
  carpenter_commision: string | null;
  architect_commision: string | null;
  created_at: Date;
  updated_at: Date;
  customer: {
    name: string;
    id: number;
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
  carpenter:
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
        id: number;
        carpenter_commision: string | null;
        architect_commision: string | null;
        quantity: number;
        delivered_quantity: number;
        rate: number;
        total_value: string;
        carpenter_commision_type: "percentage" | "perPiece" | null;
        architect_commision_type: "percentage" | "perPiece" | null;
        item_id: number;
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
        id: number;
        driver_id: number | null;
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

export const viewOrderIdAtom = atom<number | null>({
  key: "viewOrderIdAtom",
  default: null,
});

export const viewOrderMovementIdAtom = atom<number | null>({
  key: "viewOrderMovementIdAtom",
  default: null,
});

export const showCommissionAtom = atom<boolean>({
  key: "showCommissionAtom",
  default: false,
  effects: [({setSelf, onSet}) => {
    let setFalseTimeout: NodeJS.Timeout | null = null;
    onSet((val) => {
      if (val) {
        setFalseTimeout = setTimeout(() => {
          setSelf(false);
        }, 20000);
      } else {
        if (setFalseTimeout) {
          clearTimeout(setFalseTimeout);
        }
      }
    })
  }]
})