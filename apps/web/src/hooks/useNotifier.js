import { useEffect, useState } from "react";

export default function useNotifier() {
  const [isBlurred, setIsBlurred] = useState(false);

  const notify = (title, body) => {
    if (!("Notification" in window)) return;
    if (Notification.permission == "granted") {
      new Notification(title, { body });
    }
  };

  const notifyIfBlurred = (title, body) => {
    if (!isBlurred) {
      notify(title, body);
    }
  };

  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission == "default") {
        Notification.requestPermission();
      }
    }

    const visChange = () => {
      if (document.visibilityState === "hidden") {
        setIsBlurred(true);
      } else {
        setIsBlurred(false);
      }
    };
    document.addEventListener("visibilitychange", visChange);
    return () => {
      document.removeEventListener("visibilitychange", visChange);
    };
  }, []);

  return {
    notify,
    notifyIfBlurred,
  };
}
