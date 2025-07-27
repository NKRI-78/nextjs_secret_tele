// FlashNotification.tsx

import React, { useEffect } from "react";

interface FlashNotificationProps {
  message: string | null;
  type: string | null;
  onClose: () => void;
}

const FlashNotification: React.FC<FlashNotificationProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Hide after 3 seconds

      return () => clearTimeout(timer); // Cleanup the timer on unmount
    }
  }, [message, onClose]);

  if (!message) return null; // Do not render if no message

  return (
    <div className={`fixed top-3 right-3 ${type == "error" ? "bg-red-500" : "bg-green-500"} text-white p-4 rounded shadow-md`}>
      {message}
    </div>
  );
};

export default FlashNotification;
