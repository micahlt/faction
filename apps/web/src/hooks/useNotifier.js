import { useCallback, useEffect, useState } from "react";

export default function useNotifier() {
  const notify = useCallback((title, body) => {
    if (!("Notification" in window)) return;
    console.log(Notification.permission);
    if (Notification.permission == "granted") {
      new Notification(title, { body });
    }
  }, []);

  const notifyIfBlurred = useCallback(
    (title, body) => {
      if (!document.hasFocus()) {
        notify(title, body);
      }
    },
    [notify]
  );

  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission == "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  return {
    notify,
    notifyIfBlurred,
  };
}
