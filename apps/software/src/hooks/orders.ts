import { useRecoilState, useSetRecoilState } from "recoil";
import request from "@/lib/request";
import { allOrdersAtom, OrderRow,  allOrdersType, defaultAllOrders, currentFilterAtom, viewOrderAtom, viewOrderIdAtom } from "@/store/order";
import React from "react";

const orderLoadingMap = new Map<keyof allOrdersType, boolean>();

const useAllOrders = () => {
  const [orders, setOrders] = useRecoilState(allOrdersAtom);
  const [filter, setFilter] = useRecoilState(currentFilterAtom);
  const setViewOrder = useSetRecoilState(viewOrderAtom);
  const setViewOrderId = useSetRecoilState(viewOrderIdAtom);

  const fetchInitialOrders = async (skipCheck: Boolean = false) => {
    if ((orderLoadingMap.get(filter) || orders[filter].length > 0) && !skipCheck) return;
    orderLoadingMap.set(filter, true);
    try {
      const res = await request.post("/order/getAllOrders", {
        filter,
      });
      if (res.status != 200) return;
      setOrders({
        ...(skipCheck ? defaultAllOrders : orders),
        [filter]: res.data.data as OrderRow[],
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      orderLoadingMap.set(filter, false);
    }
  };

  const fetchMoreOrders = async (cursor: Date) => {
    if (orderLoadingMap.get(filter)) return;
    orderLoadingMap.set(filter, true);
    try {
      const res = await request.post("/order/getAllOrders", {
        filter,
        cursor,
      });
      if (res.status != 200) return;
      if(!orders) {
        return setOrders({
          ...defaultAllOrders,
          [filter]: res.data.data as OrderRow[]
        })
      } else {
        setOrders({
          ...orders,
          [filter]: orders[filter].push(...res.data.data as OrderRow[]),
        });
      }
    } catch (error) {
      console.error("Error fetching more orders:", error);
    } finally {
      orderLoadingMap.set(filter, false);
    }
  }
  
  const refetchOrders = () => {
    setOrders(defaultAllOrders);
    setViewOrder(null);
    setViewOrderId(null);
    fetchInitialOrders(true);
  }

  React.useEffect(() => {
    if(orderLoadingMap.get(filter) || orders[filter].length > 0) return;
    fetchInitialOrders()
  }, [filter])

  return { orders, orderLoadingMap, fetchMoreOrders, refetchOrders, filter, setFilter };
};

export { useAllOrders };
