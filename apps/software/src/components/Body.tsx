import tabAtom from "@/store/tabs";
import { useSession } from "next-auth/react";
import React from "react";
import { useRecoilState } from "recoil";
import { Button } from "./ui/button";
import { Siren } from "lucide-react";

const Body = ({ children }: { children: React.ReactNode }) => {
  const availableTabs = [
    "Home",
    "Order",
    "Customer",
    "Address",
    "Inventory",
    "Carpanter",
    "Architect",
    "Driver",
    "Estimate",
    "Resources",
  ];

  const { status } = useSession();
  const [tab, setTabs] = useRecoilState(tabAtom);

  return (
    <div className="fixed flex w-full h-full">
      <div className="w-1/6 min-w-60 h-full border-r border-border p-2">
          {availableTabs.map((value, index) => {
            return (
              <button
                className={`w-full border-b-2 border-border py-2 mb-1 font-sofiapro text-xl  hover:border-accent-foreground duration-200  ${tab == value.toLowerCase() && "bg-muted border-accent-foreground"}`}
                onClick={(_) =>
                  setTabs(
                    value.toLowerCase() as
                      | "home"
                      | "order"
                      | "customer"
                      | "address"
                      | "inventory"
                      | "carpanter"
                      | "architect"
                      | "driver"
                      | "resources"
                      | "estimate"
                  )
                }
                key={index}
              >
                {value}
              </button>
            );
          })}
        <Button variant={"destructive"} className="w-full h-14 text-2xl font-cubano my-2" onClick={()=>{window.ipcRenderer.invoke("EMERGENCY")}}>
          <Siren className="w-7 aspect-square mr-2"/>
          Emergency
        </Button>
      </div>
      <div className="w-5/6 h-full overflow-x-hidden overflow-y-auto">
        {import.meta.env.DEV || status == "authenticated" ? (
          <div className="p-10 pb-0 w-full h-full">{children}</div>
        ) : (
          <div className="flex items-center justify-center h-full font-mono uppercase text-3xl italic">
            Not Authenticated
          </div>
        )}
      </div>
    </div>
  );
};

export default Body;
