import {
  Navigate,
  Outlet,
  createFileRoute,
  useLocation,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import apiGetQuery from "../../utils/api/apiGetQuery";
import s from "../../styles/modules/app.module.css";
import FactionList from "../../components/FactionList";
import UserPanel from "../../components/UserPanel";
import MessageBox from "../../components/MessageBox";

export const Route = createFileRoute("/_authenticated/app")({
  component: RouteComponent,
});

function RouteComponent() {
  const location = useLocation();
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => apiGetQuery(`/api/users/me`),
  });

  const firstFactionId = user?.factions?.[0]?.id;
  const isAppIndexPath = location.pathname === "/app" || location.pathname === "/app/";

  if (!userLoading && firstFactionId && isAppIndexPath) {
    return (
      <Navigate
        to="/app/$factionId"
        params={{ factionId: firstFactionId }}
        replace
      />
    );
  }

  return (
    <>
      {user && !userLoading && (
        <main className={s.main}>
          <div className={s.top}>
            <div className={s.myFactions}>
              <FactionList factions={user.factions} />
            </div>
            <div className={s.currentFaction}>
              <Outlet />
            </div>
          </div>
          <div className={s.bottom}>
            <div className={s.user}>
              <UserPanel loggedInUser={user} />
            </div>
            <div className={s.messagebox}>
              <MessageBox />
            </div>
          </div>
        </main>
      )}
    </>
  );
}
