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
