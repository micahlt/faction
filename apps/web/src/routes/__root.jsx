import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useEffect } from "react";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  useEffect(() =>{
    // Asks user for notification permissions 
    if("Notification" in window){
      if(Notification.permission == "default"){
        Notification.requestPermission();
      }
    };

    // Enables display of notification
    const showNot = (title, body) => {
      if(!("Notification" in window)) return;
      if(Notification.permission == "granted"){
        new Notification(title, {body});
      }
    };

    // Allows for visibility changes
    const visChange = () => {
      if(document.visibilityState === "hidden"){
        showNot(
          "Inactive Tab", "Something Happened"
        );
      }
    };
    document.addEventListener("visibilitychange", visChange);
    return () => {
      document.removeEventListener("visibilitychange", visChange);
    };
  }, []);
  return (
    <>
      <Outlet />
      {false && <TanStackRouterDevtools />}
    </>
  );
}
