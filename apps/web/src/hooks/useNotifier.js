import { useCallback, useEffect } from "react";

export default function useNotifier() {
  const notify = useCallback((title, body, icon) => {
    if (!document.hasFocus()) {
      if (!("Notification" in window)) return;
      if (Notification.permission == "granted") {
        new Notification(title, { body, icon });
      }
    }
  }, []);

  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission == "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  return {
    notify,
  };
}
