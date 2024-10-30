
export const calculatePaymentStatus = (totalValue: number, amountPaid: number) => {
  if(amountPaid >= totalValue){
    return "Paid";
  } else if(amountPaid === 0){
    return "UnPaid";
  } else {
    return "Partial";
  }
}