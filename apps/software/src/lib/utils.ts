import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type setDebouncedValueProps = {
  value: any;
  setFunction: (value: any) => any;
  delay?: number;
  key: string
};

const timeoutMap = new Map<string, NodeJS.Timeout>()

export function setDebouncedValue({
  value,
  setFunction,
  delay = 1500,
  key
}: setDebouncedValueProps) {
  if (timeoutMap.has(key)){
    clearTimeout(timeoutMap.get(key));
  }

  const newTimeoutId = setTimeout(() => {
    setFunction(value);
    timeoutMap.delete(key);
  }, delay);

  timeoutMap.set(key, newTimeoutId);
}

export function parseBalanceToFloat(balance: string | null) {
  if (balance === null) {
    return 0;
  }
  return parseFloat(balance);
}

export function parseDateToString(date: Date | null) {
  if (date === null) {
    return "--";
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  return new Date(date).toLocaleString("en-US", options)
}