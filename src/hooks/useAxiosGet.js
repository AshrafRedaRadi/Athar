import { useEffect, useState } from "react";
import axios from "axios";

const useAxiosGet  = (endPoint) => {
  const [data, setData] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get(`https://atharai.runasp.net${endPoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
  }, [token, endPoint]);

  return {
    data,
  };
};

export default useAxiosGet;