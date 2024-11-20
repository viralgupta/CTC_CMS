import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { viewItemAtom, viewItemIDAtom, viewItemType } from "@/store/Items";
import { useRecoilState } from "recoil";
import request from "@/lib/request";
import ItemCard from "./ItemCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSetRecoilState } from "recoil";
import { viewOrderIdAtom } from "@/store/order";
import React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { calculateCommissionFromTotalCommission } from "@/lib/utils";

const ViewItem = () => {
  const [itemId, setItemID] = useRecoilState(viewItemIDAtom);
  const [viewItem, setViewItem] = useRecoilState(viewItemAtom);
  const setVIewOrderID = useSetRecoilState(viewOrderIdAtom);

  React.useEffect(() => {
    if (itemId) {
      request(`/inventory/getItem?item_id=${itemId}`).then((res) => {
        if (res.status != 200) return;
        setViewItem(res.data.data as viewItemType);
      });
    }
  }, [itemId]);

  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: (viewItem?.order_items ?? []).length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 34,
    overscan: 2,
  });

  return (
    <Dialog
      key={itemId}
      open={itemId ? true : false}
      onOpenChange={(o) => {
        if (!o) {
          setItemID(null);
          setViewItem(null);
          return;
        }
      }}
    >
      <DialogContent size="6xl">
        <DialogHeader className="hidden">
          <DialogDescription></DialogDescription>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <ItemCard item={viewItem} />
        <div
          className="w-full max-h-96 overflow-y-auto hide-scroll"
          ref={parentRef}
        >
          <Table style={{ height: `${virtualizer.getTotalSize()}px` }}>
            <TableCaption>
              A list of recent order's with this item.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Customer Name</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-center">Rate</TableHead>
                <TableHead className="text-center">Total Value</TableHead>
                <TableHead className="text-center">
                  Architect Commission
                </TableHead>
                <TableHead className="text-center">
                  Carpenter Commission
                </TableHead>
                <TableHead className="text-center">View Order</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {viewItem &&
                (viewItem?.order_items ?? []).length > 0 &&
                virtualizer.getVirtualItems().map((virtualRow, index) => {
                  const oi = viewItem.order_items[virtualRow.index];
                  return (
                    <TableRow
                      key={oi.id}
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start - index * virtualRow.size}px)`,
                      }}
                    >
                      <TableCell className="text-center">
                        {oi.order.customer?.name ?? "--"}
                      </TableCell>
                      <TableCell className="text-center">
                        {oi.quantity}
                      </TableCell>
                      <TableCell className="text-center">{`₹${oi.rate.toFixed(2)} per ${viewItem.rate_dimension}`}</TableCell>
                      <TableCell className="text-center">{`₹${oi.total_value}`}</TableCell>
                      <TableCell className="text-center">
                        {oi.architect_commision
                          ? `₹${oi.architect_commision} ${calculateCommissionFromTotalCommission(oi.architect_commision, oi.architect_commision_type, oi.total_value, oi.quantity).bracket}`
                          : "--"}
                      </TableCell>
                      <TableCell className="text-center">
                        {oi.carpanter_commision
                          ? `₹${oi.carpanter_commision} ${calculateCommissionFromTotalCommission(oi.carpanter_commision, oi.carpanter_commision_type, oi.total_value, oi.quantity).bracket}`
                          : "--"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size={"sm"}
                          onClick={() => {
                            setVIewOrderID(oi.order_id);
                          }}
                        >
                          View Order
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewItem;
