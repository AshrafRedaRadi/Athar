import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

const useAxiosGet = (endPoint) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!endPoint) return;
    apiFetch(endPoint)
      .then((response) => {
        setData(response);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [endPoint]);

  return {
    data,
  };
};

export default useAxiosGet;