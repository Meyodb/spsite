import { useEffect } from "react";

export const Allergenes = () => {
  useEffect(() => {
    window.location.replace("/allergenes.pdf");
  }, []);

  return null;
};
