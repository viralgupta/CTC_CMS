import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAllTiers } from "@/hooks/tier";
import { allTierAtom } from "@/store/tier";
import { Eye } from "lucide-react";
import { useRecoilValue } from "recoil";
import ViewTier from "./ViewTier";

const AllTierTable = () => {
  const { loading } = useAllTiers();
  const tiers = useRecoilValue(allTierAtom);

  if (loading) {
    return <Skeleton className="w-full h-44" />;
  } else {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Tier Name</TableHead>
            <TableHead className="text-center w-[100px]">View</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tiers.map((tier) => (
            <TableRow key={tier.id}>
              <TableCell className="py-2 text-center">
                {tier.name}
              </TableCell>
              <TableCell className="py-2 text-center">
                <ViewTier tier_id={tier.id}>
                  <Button size={"icon"}>
                    <Eye />
                  </Button>
                </ViewTier>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
};

export default AllTierTable;
