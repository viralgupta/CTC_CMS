import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { viewItemAtom, viewItemIDAtom, viewItemType } from "@/store/Items";
import { useRecoilState } from "recoil";
import request from "@/lib/request";
import ItemCard from "./ItemCard";
import React from "react";
import ViewItemOrdersTable from "./ViewItemOrdersTable";

const ViewItem = () => {
  const [itemId, setItemID] = useRecoilState(viewItemIDAtom);
  const [viewItem, setViewItem] = useRecoilState(viewItemAtom);

  React.useEffect(() => {
    if (itemId) {
      request(`/inventory/getItem?item_id=${itemId}`).then((res) => {
        if(res.status != 200) return;
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
          <ViewItemOrdersTable item={viewItem}/>
      </DialogContent>
    </Dialog>
  );
};

export default ViewItem;
