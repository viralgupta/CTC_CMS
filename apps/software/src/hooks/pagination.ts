import React from "react";

const loadingMap = new Map<number, boolean>();

type usePaginationType<T extends Record<string, any>> = {
  initialData: T[];
  uniqueKey: keyof T;
  fetchNextPage: (cursor: number) => Promise<T[]>;
  pageSize: number;
  key: number;
}

const usePagination = <T extends Record<string, any>>({initialData, uniqueKey, fetchNextPage, pageSize, key}: usePaginationType<T>) => {
  const [data, setData] = React.useState(initialData);
  const [cursor, setCursor] = React.useState<number>(initialData[initialData.length - 1][uniqueKey] ?? 0);
  const [hasNextPage, setHasNextPage] = React.useState(pageSize > initialData.length ? false : true);
  loadingMap.set(key, false);

  const fetchMore = async () => {
    if (loadingMap.get(key)) return;
    loadingMap.set(key, true);
    const newData = await fetchNextPage(cursor);
    if (newData.length < pageSize) {
      setHasNextPage(false);
    }
    if(newData.length > 0) {
      setCursor(newData[newData.length - 1][uniqueKey]);
    }
    setData(d => [...(d ?? []), ...newData]);
    loadingMap.set(key, false);
  }

  React.useEffect(() => {
    if(initialData) {
      setData(initialData);
      if (initialData.length < pageSize) {
        setHasNextPage(false);
      }
      if(initialData.length > 0) {
        setCursor(initialData[initialData.length - 1][uniqueKey]);
      }
    }
  }, [initialData]);

  return { hasNextPage, loadingMap, fetchMore, data };  
}

export default usePagination;