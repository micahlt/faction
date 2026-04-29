import { createFileRoute } from "@tanstack/react-router";
import MessageListRenderer from "../../../../components/MessageListRenderer";
import { useSocket } from "../../../../components/contexts/SocketContext";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/app/$factionId/$topicId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { factionId, topicId } = Route.useParams();
  const socket = useSocket();

  useEffect(() => {
    socket.emit("topic:join", topicId);
    return () => {
      socket.emit("topic:leave", topicId);
    };
  }, [topicId]);

  return <MessageListRenderer factionId={factionId} topicId={topicId} />;
}
