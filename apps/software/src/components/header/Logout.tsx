import { useSession, signOut } from "next-auth/react";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";

const Logout = () => {
  const { status } = useSession();

  if(status == "loading" || status == "unauthenticated") return null;

  const handleLogout = async () => {
    await signOut();
  };

  return <Button onClick={handleLogout} variant={"destructive"}>Logout&nbsp;<LogoutIcon/></Button>;
};

const LogoutIcon = () => {
  return (
    <LogOut className="h-full aspect-square stroke-primary-foreground"/>
  );
};

export default Logout;
