import { Navigate, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import apiGetQuery from "../../../../utils/api/apiGetQuery";

export const Route = createFileRoute("/_authenticated/app/$factionId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { factionId } = Route.useParams();
  const { data: faction, isLoading: factionLoading } = useQuery({
    queryKey: ["factions", factionId],
    queryFn: () => apiGetQuery(`/api/factions/${factionId}?topics=true`),
  });

  const firstTopicId = faction?.topics?.[0]?.id;

  if (!factionLoading && firstTopicId) {
    return (
      <Navigate
        to="/app/$factionId/$topicId"
        params={{ factionId, topicId: firstTopicId }}
        replace
      />
    );
  }

  return null;
}
