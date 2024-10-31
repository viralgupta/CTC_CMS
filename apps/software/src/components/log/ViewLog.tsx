import { viewLogButtonAtom, viewLogType } from "@/store/log";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, Link, User } from "lucide-react";
import React from "react";
import request from "@/lib/request";
import { Skeleton } from "../ui/skeleton";
import { Textarea } from "../ui/textarea";
import { convertTypeToHeading, parseDateToString } from "@/lib/utils";
import { Button } from "../ui/button";
import { useSetRecoilState } from "recoil";

const ViewLog = ({
  logId,
  children,
}: {
  logId: number;
  children: React.ReactNode;
}) => {
  const [viewLog, setViewLog] = React.useState<viewLogType | null>(null);
  const [open, setOpen] = React.useState(false);
  const setViewLogButton = useSetRecoilState(viewLogButtonAtom);

  const typeColors = {
    CREATE: "text-green-500",
    UPDATE: "text-blue-500",
    DELETE: "text-red-500",
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setViewLog(null);
        } else {
          request.get(`/miscellaneous/getLog?id=${logId}`).then((res) => {
            setViewLog(res.data.data);
          });
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent size="3xl">
        <DialogHeader className="hidden">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        {viewLog ? (
          <div className="w-full h-full space-y-2">
            <Card className="w-full">
              <CardContent className="p-2 flex items-center justify-around">
                <div className={`${typeColors[viewLog.type]}`}>
                  {viewLog.type}
                </div>
                <div className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  {viewLog.linked_to}
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {viewLog.user?.name || "Unknown User"}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {parseDateToString(viewLog.created_at)}
                </div>
              </CardContent>
            </Card>
            <div className="text-xl font-cubano">Heading</div>
            <Input className="w-full" defaultValue={viewLog.heading ?? convertTypeToHeading(viewLog.type, viewLog.linked_to)}/>
            <div className="text-xl font-cubano">Links</div>
            <div className="w-full p-2 border rounded-md space-x-2">
              {(Object.keys(viewLog) as Array<keyof viewLogType>).map((key) => {
                if((key == "user_id" || key == "customer_id" || key == "architect_id" || key == "carpanter_id" || key == "driver_id" || key == "item_id" || key == "order_id") && typeof(viewLog[key]) == "string" && !!viewLog[key]){
                  return <Button onClick={() => {setViewLogButton({type: {[key]: viewLog[key] ?? ""}}); setOpen(false);}} key={key} variant={"outline"}>View {key[0].toUpperCase() + key.slice(1, -3)} Logs</Button>
                }
              })}
            </div>
            <div className="text-xl font-cubano">Message</div>
            <Textarea
              className="w-full h-48 overflow-y-auto hide-scroll"
              defaultValue={viewLog.message}
            />
          </div>
        ) : (
          <Skeleton className="w-full h-96" />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewLog;
