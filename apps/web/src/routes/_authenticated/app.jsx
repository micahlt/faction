import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import apiGetQuery from "../../utils/api/apiGetQuery";
import s from "../../styles/modules/app.module.css";
import FactionList from "../../components/FactionList";
import FactionSidebar from "../../components/FactionSidebar";

export const Route = createFileRoute("/_authenticated/app")({
  component: RouteComponent,
});

function RouteComponent() {
  const {
    data: user,
    error: userError,
    isLoading: userLoading,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => apiGetQuery(`/api/users/me`),
  });

  return (
    <div>
      {user && !userLoading && (
        <main className={s.main}>
          <div className={s.sidebar}>
            <FactionList factions={user.factions} />
            <FactionSidebar factionId={user.factions[0].id} />
          </div>
          <div className={s.messages}>messages</div>
          <div className={s.user}>user</div>
          <div className={s.messagebox}>input</div>
        </main>
      )}
    </div>
  );
}
