import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRecoilState } from "recoil";
import request from "@/lib/request";
import React from "react";
import { viewOrderMovementIdAtom } from "@/store/order";
import { Skeleton } from "@/components/ui/skeleton";
import MovementCard from "./MovementCard";
import OrderMovementItemTable from "./OrderMovementItemTable";

export interface viewMovementType {
  id: string;
  type: "DELIVERY" | "RETURN";
  status: "Pending" | "Completed";
  driver_id: string | null;
  order_id: string;
  created_at: Date;
  delivery_at: Date | null;
  labour_frate_cost: number;
  driver: {
    name: string;
    profileUrl: string | null;
    vehicle_number: string | null;
    phone_numbers: {
      phone_number: string;
    }[]; // only one
  } | null | undefined;
  order: {
    id: string;
    customer: {
      id: string;
      name: string;
      profileUrl: string | null;
    } | null;
    delivery_address: {
      id: string;
      address: string;
      house_number: string;
      address_area: {
          area: string;
      };
    } | null;
  } | undefined
  order_movement_items: {
    id: string;
    quantity: number;
    order_item: {
        quantity: number;
        item: {
            name: string;
        };
    };
  }[] | undefined
}

const ViewDriver = () => {
  const [viewOrderMovement, setViewOrderMovement] = React.useState<viewMovementType | null>(null);
  const [viewOrderMovementId, setViewOrderMovementId] = useRecoilState(viewOrderMovementIdAtom);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (viewOrderMovementId) {
    setLoading(true);
    request(`/order/getMovement?id=${viewOrderMovementId}`).then((res) => {
        setLoading(false);
        if(res.status != 200) return;
        setViewOrderMovement(res.data.data as viewMovementType);
      })
    }
  }, [viewOrderMovementId]);

  return (
    <Dialog
      key={viewOrderMovementId}
      open={viewOrderMovementId ? true : false}
      onOpenChange={(o) => {
        if (!o) {
          setViewOrderMovementId(null);
          setViewOrderMovement(null);
          return;
        }
      }}
    >
      <DialogContent size="5xl">
        <DialogHeader className="hidden">
          <DialogDescription></DialogDescription>
          <DialogTitle>Order Movement</DialogTitle>
        </DialogHeader>
        {!loading ? (
          <MovementCard movement={viewOrderMovement} />
        ) : (
          <Skeleton className="w-full h-44" />
        )}
        <div className="text-2xl font-cubano">Order Movement Items</div>
        {!loading ? (
          <OrderMovementItemTable
            type={viewOrderMovement?.type}
            order_movement_items={viewOrderMovement?.order_movement_items}
          />
        ) : (
          <Skeleton className="w-full h-96" />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewDriver;
