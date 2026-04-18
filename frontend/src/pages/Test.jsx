import { useEffect } from "react";
import { getDoubts } from "../services/api";

function Test() {
  useEffect(() => {
    getDoubts()
      .then((res) => {
        console.log("DATA:", res.data);
      })
      .catch((err) => {
        console.error("ERROR:", err);
      });
  }, []);

  return <div>Check console</div>;
}

export default Test;