import { useSession } from "next-auth/react";
import LoginDialog from "./LoginDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CircleUserRound } from "lucide-react";

const User = () => {
  const { data, status } = useSession();

  return (
    <LoginDialog disabled={status == "authenticated" || status == "loading"}>
      {status == "loading" ? (
        <Skeleton className="w-24 h-10 border border-border rounded-md disabled:cursor-default"/>
      ) : (
        <div className="flex p-2 items-center border border-border rounded-md disabled:cursor-default">
          <UserIcon />
          &nbsp;{status == "unauthenticated" ? "Login" : data?.user?.name}
        </div>
      )}
    </LoginDialog>
  );
};

const UserIcon = () => {
  return (
    <CircleUserRound className="stroke-primary"/>
  );
};

export default User;
