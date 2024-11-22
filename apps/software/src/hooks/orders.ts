import { useRecoilState, useSetRecoilState } from "recoil";
import request from "@/lib/request";
import { allOrdersAtom, OrderRow,  allOrdersType, defaultAllOrders, currentFilterAtom, viewOrderAtom, viewOrderIdAtom } from "@/store/order";
import React from "react";

const orderFilterKeys = [
  "Status-Pending",
  "Status-Delivered",
  "Priority-High",
  "Priority-Medium",
  "Priority-Low",
  "Payment-UnPaid",
  "Payment-Partial",
  "Payment-Paid",
  "All",
];

const orderLoadingMap = new Map<keyof allOrdersType, boolean>();
const orderCursorMap = new Map<keyof allOrdersType, number>(
  orderFilterKeys.map((key) => [key as keyof allOrdersType, 0]),
);
const orderHasNextPageMap = new Map<keyof allOrdersType, boolean>(
  orderFilterKeys.map((key) => [key as keyof allOrdersType, true]),
);

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
      if(res.data.data.length < 10) {
        orderHasNextPageMap.set(filter, false);
      }
      if(res.data.data.length > 0){
        orderCursorMap.set(filter, res.data.data[res.data.data.length - 1].id);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      orderLoadingMap.set(filter, false);
    }
  };

  const fetchMoreOrders = async () => {
    if (orderLoadingMap.get(filter)) return;
    orderLoadingMap.set(filter, true);
    try {
      const res = await request.post("/order/getAllOrders", {
        filter,
        cursor: orderCursorMap.get(filter),
      });
      if (res.status != 200) return;
      if(!orders) {
        setOrders({
          ...defaultAllOrders,
          [filter]: res.data.data as OrderRow[]
        });
      } else {
        setOrders({
          ...orders,
          [filter]: [...orders[filter], ...res.data.data as OrderRow[]],
        });
      }
      if(res.data.data.length < 10) {
        orderHasNextPageMap.set(filter, false);
      }
      if(res.data.data.length > 0){
        orderCursorMap.set(filter, res.data.data[res.data.data.length - 1].id);
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
    orderFilterKeys.map((key) => orderHasNextPageMap.set(key as keyof allOrdersType, true));
  }

  React.useEffect(() => {
    if(orderLoadingMap.get(filter) || orders[filter].length > 0) return;
    fetchInitialOrders()
  }, [filter])

  return { orders, orderLoadingMap, orderHasNextPageMap, fetchMoreOrders, refetchOrders, filter, setFilter };
};

export { useAllOrders };
