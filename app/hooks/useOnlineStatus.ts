import { useEffect, useState } from "react";

const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateStatus = () => setIsOnline(navigator.onLine);

      window.addEventListener("online", updateStatus);
      window.addEventListener("offline", updateStatus);

      setIsOnline(navigator.onLine);

      return () => {
        window.removeEventListener("online", updateStatus);
        window.removeEventListener("offline", updateStatus);
      };
    }
  }, []);

  return isOnline;
};

export default useOnlineStatus;