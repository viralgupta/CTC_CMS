
export const calculatePaymentStatus = (totalValue: number, amountPaid: number) => {
  if(amountPaid >= totalValue){
    return "Paid";
  } else if(amountPaid === 0){
    return "UnPaid";
  } else {
    return "Partial";
  }
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[] | K): Omit<T, K> {
  const keysArray = Array.isArray(keys) ? keys : [keys];
  const result = {} as Omit<T, K>;

  Object.entries(obj).forEach(([key, value]) => {
    if (!keysArray.includes(key as K)) {
      (result as T)[key as keyof T] = value;
    }
  });

  return result;
}
