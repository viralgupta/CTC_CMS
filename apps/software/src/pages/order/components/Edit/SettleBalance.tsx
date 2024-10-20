import { viewOrderAtom } from "@/store/order";
import { useRecoilValue } from "recoil";
import request from "@/lib/request";
import { z } from "zod";
import { settleBalanceType } from "@type/api/order";
import { useAllOrders } from "@/hooks/orders";
import SettleBalanceForm from "@/components/Inputs/SettleBalanceForm";

const SettleBalance = ({ closeDialog }: { closeDialog?: () => void }) => {
  const viewOrder = useRecoilValue(viewOrderAtom);
  const { refetchOrders } = useAllOrders();

  const onSubmit = async (value: z.infer<typeof settleBalanceType>) => {
    await request.put("/order/settleBalance", value);
    closeDialog && closeDialog();
    refetchOrders();
  };

  return (
    <div className="space-y-4 flex flex-col">
      <SettleBalanceForm
        existingBalance={(
          parseFloat(viewOrder?.total_order_amount ?? "0.00") -
          parseFloat(viewOrder?.amount_paid ?? "0.00")
        ).toFixed(2)}
        onSubmit={({ amount, operation }) => {
          onSubmit({
            amount,
            operator: operation == "add" ? "Addition" : "Subtraction",
            order_id: viewOrder?.id ?? "",
          });
        }}
      />
    </div>
  );
};

export default SettleBalance;
