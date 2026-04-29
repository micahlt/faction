import { useQuery } from "@tanstack/react-query";
import s from "../styles/modules/FactionSidebar.module.css";
import apiGetQuery from "../utils/api/apiGetQuery";
import TopicListItem from "./TopicListItem";
import { EnvelopeIcon, PlusIcon } from "@phosphor-icons/react";
import { useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import CreateTopicForm from "./CreateTopicForm";
import CreateInviteForm from "./CreateInviteForm";
import Modal from "./Modal";
import useDoesHaveAdmin from "../hooks/useDoesHaveAdmin";
import { useSocket } from "../components/contexts/SocketContext"

export default function FactionSidebar({ factionId = "" }) {
  const {
    data: faction,
    error: factionError,
    isLoading: factionLoading,
  } = useQuery({
    queryKey: ["factions", factionId],
    queryFn: () => apiGetQuery(`/api/factions/${factionId}?topics=true`),
  });
  const { topicId } = useParams({ strict: false });
  const isAdmin = useDoesHaveAdmin(factionId);
  const socket = useSocket();
  const [creatingTopic, setCreatingTopic] = useState(false);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [typingTopics, setTypingTopics] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleTypingStart = ({ topicId: typingTopicId }) => {
      setTypingTopics((topics) => {
        return [...topics, typingTopicId];
      });
    };

    const handleTypingStop = ({ topicId: typingTopicId }) => {
      setTypingTopics((topics) => topics.filter((topicId) => topicId !== typingTopicId));
    };

    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    return () => {
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
    };
  }, [socket, topicId]);

  return (
    <div className={s.factionSidebar}>
      {faction && !factionError && (
        <>
          <span className={s.factionPretitle}>FACTION</span>
          <h2>{faction?.name}</h2>
          <div className={s.topicsList}>
            {faction.topics.map((topic) => (
              <TopicListItem topic={topic} active={topic.id === topicId} typingInTopic={typingTopics.includes(topic.id)} key={topic.id} />
            ))}
          </div>
          {isAdmin && (
            <div className={s.sidebarOptions}>
              <a
                href="#"
                className={s.sidebarOptionBtn}
                onClick={(e) => {
                  e.preventDefault();
                  setCreatingTopic(true);
                }}
              >
                <PlusIcon size={18} /> Topic
              </a>
              <a
                href="#"
                className={s.sidebarOptionBtn}
                onClick={(e) => {
                  e.preventDefault();
                  setCreatingInvite(true);
                }}
              >
                <EnvelopeIcon size={18} /> Invite
              </a>
            </div>
          )}
        </>
      )}
      {creatingTopic &&
        createPortal(
          <Modal canCloseOnOverlay={true} onClose={() => setCreatingTopic(false)}>
            <CreateTopicForm factionId={faction.id} onCreated={() => setCreatingTopic(false)} />
          </Modal>,
          document.body
        )}
      {creatingInvite &&
        createPortal(
          <Modal canCloseOnOverlay={true} onClose={() => setCreatingInvite(false)}>
            <CreateInviteForm factionId={faction.id} onCreated={() => setCreatingInvite(false)} />
          </Modal>,
          document.body
        )}
    </div>
  );
}
