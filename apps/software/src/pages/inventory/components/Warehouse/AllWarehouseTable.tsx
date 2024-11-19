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
import { useAllWarehouse } from "@/hooks/warehouse";
import { allWarehouseAtom } from "@/store/warehouse";
import { Eye } from "lucide-react";
import { useRecoilValue } from "recoil";
import ViewWarehouse from "./ViewWarehouse";

const AllWarehouseTable = () => {
  const { loading } = useAllWarehouse();
  const warehouses = useRecoilValue(allWarehouseAtom);

  if (loading) {
    return <Skeleton className="w-full h-44" />;
  } else {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Warehouse Name</TableHead>
            <TableHead className="text-center w-[100px]">View</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {warehouses.map((warehouse) => (
            <TableRow key={warehouse.id}>
              <TableCell className="py-2 text-center">
                {warehouse.name}
              </TableCell>
              <TableCell className="py-2 text-center">
                <ViewWarehouse warehouse_id={warehouse.id}>
                  <Button size={"icon"}>
                    <Eye />
                  </Button>
                </ViewWarehouse>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
};

export default AllWarehouseTable;
