import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { viewItemAtom, viewItemIDAtom, viewItemType } from "@/store/Items";
import { useRecoilState } from "recoil";
import request from "@/utils/request";
import ItemCard from "@/components/inventory/ItemCard";
import React from "react";

const ViewItem = () => {
  const [itemId, setItemID] = useRecoilState(viewItemIDAtom);
  const [viewItem, setViewItem] = useRecoilState(viewItemAtom);

  React.useEffect(() => {
    if (itemId) {
      request(`/inventory/getItem?item_id=${itemId}`).then((res) => {
        setViewItem(res.data.data as viewItemType);
      })
    }
  }, [itemId]);

  return (
    <Dialog
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
      </DialogContent>
    </Dialog>
  );
};

export default ViewItem;
