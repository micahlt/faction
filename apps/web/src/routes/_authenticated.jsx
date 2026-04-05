import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import isAuthenticated from "../utils/isAuthenticated";
import { SocketProvider } from "../components/contexts/SocketContext";

export const Route = createFileRoute("/_authenticated")({
  component: () => <SocketProvider>
    <Outlet />
  </SocketProvider>,
  beforeLoad: async ({ location }) => {
    if (!(await isAuthenticated())) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
});
