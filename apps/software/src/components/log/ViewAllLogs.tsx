import { viewAllLogAtom, viewAllLogType, viewLogButtonAtom, viewLogButtonType } from "@/store/log";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
import request from "@/lib/request";
import { Eye } from "lucide-react";
import { Button } from "../ui/button";
import { convertTypeToHeading, debounce, parseDateToString } from "@/lib/utils";
import { useRecoilState } from "recoil";
import { Skeleton } from "../ui/skeleton";
import ViewLog from "./ViewLog";
import { ColumnDef } from "@tanstack/react-table";
import PaginationDataTable from "../PaginationDataTable";

let hasNextPage = true;

const ViewAllLogs = () => {
  const [viewLogButton, setViewLogButton] = useRecoilState(viewLogButtonAtom);
  const [viewAllLogs, setViewAllLogs] = useRecoilState(viewAllLogAtom);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [cursor, setCursor] = React.useState(0);

  const columns: ColumnDef<viewAllLogType>[] = [
    {
      id: "heading",
      accessorKey: "heading",
      header: "Heading",
      cell: ({ row }) => (
        <span>
          {row.original.heading
            ? row.original.heading
            : convertTypeToHeading(row.original.type, row.original.linked_to)}
        </span>
      ),
    },
    {
      id: "type",
      accessorKey: "type",
      header: "Type",

    },
    {
      id: "linked_to",
      accessorKey: "linked_to",
      header: "Linked To",
    },
    {
      id: "user",
      accessorKey: "user",
      header: "User",
      cell: ({ row }) => (
        <span>
          {row.original.user.name}
        </span>
      ),
    },
    {
      id: "created_at",
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => (
        <span>
          {parseDateToString(row.original.created_at)}
        </span>
      ),
    },
    {
      id: "view",
      accessorKey: "view",
      header: "View",
      cell: ({ row }) => (
        <ViewLog logId={row.original.id}>
          <Button>
            <Eye />
          </Button>
        </ViewLog>
      ),
    },
  ];

  const getMoreLogs = debounce(() => {
    if(viewLogButton){
      const queryParams = new URLSearchParams();
      if (viewLogButton.type) {
        Object.entries(viewLogButton.type).forEach(([key, value]) => {
          if (value) {
            queryParams.append(key, value.toString());
          }
        });
      } else {
        if (viewLogButton.linked_to) {
          queryParams.append("linked_to", viewLogButton.linked_to);
        }
      }
      queryParams.append("cursor", cursor.toString())
      setLoading(true);
      request
        .get(`/miscellaneous/getAllLogs?${queryParams.toString()}`)
        .then((res) => {
          setViewAllLogs([...(viewAllLogs ?? []), ...res.data.data]);
          if(res.data.data.length < 10) {
            hasNextPage = false;
          }
          if(res.data.data.length > 0){
            setCursor(res.data.data[res.data.data.length - 1].id);
          }
        }).catch((err) => {
          console.log("Unable to fetch more logs", err);
        }).finally(() => {
          setLoading(false);
        })
    }
  });

  React.useEffect(() => {
    if (viewLogButton) {
      setOpen(true);
      const queryParams = new URLSearchParams();
      if (viewLogButton.type) {
        Object.entries(viewLogButton.type).forEach(([key, value]) => {
          if (value) {
            queryParams.append(key, value.toString());
          }
        });
      } else {
        if (viewLogButton.linked_to) {
          queryParams.append("linked_to", viewLogButton.linked_to);
        }
      }
      setLoading(true);
      request
        .get(`/miscellaneous/getAllLogs?${queryParams.toString()}`)
        .then((res) => {
          setViewAllLogs(res.data.data);
          if(res.data.data.length < 10) {
            hasNextPage = false;
          }
          if(res.data.data.length > 0){
            setCursor(res.data.data[res.data.data.length - 1].id);
          }
        }).catch((err) => {
          console.log("Unable to fetch logs", err);
        }).finally(() => {
          setLoading(false);
        })
    }
  }, [viewLogButton]);

  function convertObjectToKey(logType: viewLogButtonType["type"]) {
    if (!logType) return "";
    Object.entries(logType).forEach(([_key, value]) => {
      return value;
    });
  }

  return (
    <Dialog
      key={viewLogButton?.linked_to ? viewLogButton.linked_to : convertObjectToKey(viewLogButton?.type)}
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setViewLogButton(null);
          setViewAllLogs(null);
          hasNextPage = true;
        }
      }}
    >
      <DialogContent size="5xl" className="h-[80%] flex flex-col">
        <DialogHeader>
          <DialogTitle>View All Logs</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        {viewAllLogs ? (
          <PaginationDataTable
            data={viewAllLogs}
            key={"viewAllLogs"}
            columns={columns}
            columnFilters={false}
            defaultColumn={{
              meta: {
                headerStyle: {
                  textAlign: "center",
                },
              },
            }}
            fetchNextPage={getMoreLogs}
            hasNextPage={hasNextPage ?? false}
            isFetchingNextPage={loading && viewAllLogs.length > 0 ? true : false}
            message="No logs found for particular filter!"
          />
        ) : (
          <Skeleton className="w-full h-96" />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewAllLogs;
