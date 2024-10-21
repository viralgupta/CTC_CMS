import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { viewItemIDAtom } from "@/store/Items";
import { useSetRecoilState } from "recoil";
import { Button } from "@/components/ui/button";
import { ViewEstimateType } from "@/store/estimates";

const EstimateItemTable = ({
  estimate_items,
}: {
  estimate_items: ViewEstimateType["estimate_items"];
}) => {
  if (!estimate_items) return <Skeleton className="w-full h-48 mt-2" />;
  const setVIewItemID = useSetRecoilState(viewItemIDAtom);

  return (
    <Table>
      <TableCaption>A list of items in the estimate.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Name</TableHead>
          <TableHead className="text-center">Quantity</TableHead>
          <TableHead className="text-center">Rate</TableHead>
          <TableHead className="text-center">Total Value</TableHead>
          <TableHead className="text-center">View Item</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {estimate_items.map((ei, i) => {
          return (
            <TableRow key={i}>
              <TableCell className="text-center">{ei.item.name}</TableCell>
              <TableCell className="text-center">{ei.quantity}</TableCell>
              <TableCell className="text-center">{`₹${ei.rate.toFixed(2)} per ${ei.item?.rate_dimension}`}</TableCell>
              <TableCell className="text-center">{`₹${ei.total_value}`}</TableCell>
              <TableCell className="text-center">
                <Button
                  size={"sm"}
                  onClick={() => {
                    setVIewItemID(ei.item_id);
                  }}
                >
                  View Item
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default EstimateItemTable;
