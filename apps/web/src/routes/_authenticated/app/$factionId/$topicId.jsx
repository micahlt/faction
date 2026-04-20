import { createFileRoute } from "@tanstack/react-router";
import MessageListRenderer from "../../../../components/MessageListRenderer";

export const Route = createFileRoute("/_authenticated/app/$factionId/$topicId")(
  {
    component: RouteComponent,
  },
);

function RouteComponent() {
  const { factionId, topicId } = Route.useParams();
  return <MessageListRenderer factionId={factionId} topicId={topicId} />;
}
