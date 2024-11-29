import { useRecoilState } from "recoil";
import request from "@/lib/request";
import { allEstimateAtom, EstimateType } from "@/store/estimates";
import React from "react";

let loading = false;
let firstTime = true;
let cursor = 0;

const useAllEstimates = () => {
  const [estimates, setEstimates] = useRecoilState(allEstimateAtom);
  const [hasNextPage, setHasNextPage] = React.useState(true);

  const fetchInitialEstimates = async () => {
    loading = true;
    try {
      const res = await request("/estimate/getAllEstimate");
      if (res.status != 200) return;
      setEstimates(res.data.data as EstimateType[]);
      if(res.data.data.length < 10) {
        setHasNextPage(false);
      }
      if(res.data.data.length > 0){
        cursor = res.data.data[res.data.data.length - 1].id
      }
    } catch (error) {
      console.error("Error fetching estimates:", error);
    } finally {
      loading = false;
    }
  };
  
  if (firstTime) {
    fetchInitialEstimates();
    firstTime = false;
  }

  const fetchMoreEstimates = async () => {
    if (loading) return;
    loading = true;
    try {
      const res = await request("/estimate/getAllEstimate?cursor=" + cursor);
      if (res.status != 200) return;
      setEstimates([...estimates, ...res.data.data as EstimateType[]]);
      if(res.data.data.length < 10) {
        setHasNextPage(false);
      }
      if(res.data.data.length > 0){
        cursor = res.data.data[res.data.data.length - 1].id;
      }
    } catch (error) {
      console.error("Error fetching more estimates:", error);
    } finally {
      loading = false;
    }
  }
  
  const refetchEstimates = () => {
    if(loading) return;
    setEstimates([]);
    setHasNextPage(true);
    cursor = 0;
    fetchInitialEstimates();
  }

  return { estimates, loading, refetchEstimates, hasNextPage, fetchMoreEstimates };
};

export { useAllEstimates  };
