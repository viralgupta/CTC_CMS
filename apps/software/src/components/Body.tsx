import tabAtom from "@/store/tabs";
import { useSession } from "next-auth/react";
import React from "react";
import { useRecoilState } from "recoil";

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
              className={`w-full border-b-2 border-border py-4 mb-1 font-sofiapro text-xl hover:bg-zinc-800 ${tab == value.toLowerCase() && "bg-zinc-900"}`}
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
                )
              }
              key={index}
            >
              {value}
            </button>
          );
        })}
      </div>
      <div className="w-5/6 h-full overflow-x-hidden overflow-y-auto">
        {status == "authenticated" ? (
          <div className="p-10 w-full h-full">{children}</div>
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
