import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import isAuthenticated from "../utils/isAuthenticated";

export const Route = createFileRoute("/_authenticated")({
  component: () => <Outlet />,
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
