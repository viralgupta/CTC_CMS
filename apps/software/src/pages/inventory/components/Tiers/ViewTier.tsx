import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import Spinner from "@/components/ui/Spinner";
import { createTierType } from "@type/api/item";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useSetRecoilState } from "recoil";
import { viewItemIDAtom } from "@/store/Items";
import request from "@/lib/request";
import { ColumnDef } from "@tanstack/react-table";
import { useAllTiers } from "@/hooks/tier";
import DataTable from "@/components/DataTable";
import CreateTier from "./CreateTier";

type TierItemsType = {
  id: number;
  item_id: number;
  commision: string;
  commision_type: "percentage" | "perPiece";
};

export type ViewTierType = {
  id: number;
  name: string;
  carpanterCount: number;
  architectCount: number;
  tier_items: TierItemsType[];
}

const ViewTier = ({
  tier_id,
  children,
}: {
  tier_id: number;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = React.useState(false);
  const [tier, setTier] = React.useState<null | ViewTierType>(null);
  const { refetchTiers } = useAllTiers();
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const deleteTier = async () => {
    setDeleteLoading(true);
    const res = await request.delete("/inventory/deleteTier", {
      data: { tier_id: tier?.id ?? "" },
    });
    if (res.status == 200) {
      setOpen(false);
      refetchTiers();
    }
    setDeleteLoading(false);
  };

  const EditTier = (values: z.infer<typeof createTierType>) => {
    request.put("/inventory/editTier", {...values, tier_id: tier?.id})
      .then((res) => {
        if (res.status == 200) {
          setOpen(false);
          refetchTiers();
        }
      });
  }
  
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o && !tier) {
          request.get("inventory/getTier?tier_id=" + tier_id)
            .then((res) => {
              setTier(res.data.data);
            });
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      {tier && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tier Items in {tier.name}</DialogTitle>
            <DialogDescription className="hidden"></DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-md border py-2">
            <div className="w-full text-center">Carpenter's Linked: {tier.carpanterCount ?? 0}</div>
            <div className="w-full text-center">Architect's Linked: {tier.architectCount ?? 0}</div>
          </div>
          <div className="flex gap-2">
            <CreateTier defaultValues={tier} onSubmit={EditTier}>
              <Button variant={"outline"} className="w-full flex items-center gap-2">
                Edit Tier <Pencil />
              </Button>
            </CreateTier>
            <Button
              disabled={deleteLoading}
              variant={"outline"}
              className="w-full"
              onClick={deleteTier}
            >
              {deleteLoading ? (
                <Spinner />
              ) : (
                <div className="flex gap-1">
                  Delete Tier
                  <Trash2 />
                </div>
              )}
            </Button>
          </div>
          <div className="max-h-96 overflow-y-auto hide-scroll flex flex-col">
            <TierItemsTable viewTier={tier} />
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
};

const TierItemsTable = ({ viewTier }: { viewTier: ViewTierType }) => {
  const setViewItemId = useSetRecoilState(viewItemIDAtom);

  const columns: ColumnDef<TierItemsType>[] = [
    {
      id: "item_name",
      accessorKey: "item.name",
      header: "Item Name",
    },
    {
      id: "commision",
      accessorKey: "commision",
      header: "Commision",
    },
    {
      id: "commision_type",
      accessorKey: "commision_type",
      header: "Commision",
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const itemId = row.original.item_id;
        return (
          <div className="aspect-square flex items-center rounded-md hover:bg-muted-foreground/70 p-1" onClick={() => setViewItemId(itemId)}>
            <Eye className="h-6 aspect-square" />
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      thin
      data={viewTier.tier_items}
      key={"tier-items"}
      columns={columns}
      columnFilters={false}
      defaultColumn={{
        meta: {
          headerStyle: {
            textAlign: "center",
          },
        },
      }}
      message="No Tier Items Found In This Tier!"
    />
  );
}

export default ViewTier;
