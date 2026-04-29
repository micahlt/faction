import Message from "./Message";
import s from "../styles/modules/MessageListRenderer.module.css";
import { useSocket } from "./contexts/SocketContext";
import { useCallback, useEffect, useState } from "react";
import useNotifier from "../hooks/useNotifier";
import { useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

export default function MessageListRenderer({ factionId = "", topicId = "" }) {
  const socket = useSocket();
  const { notifyIfBlurred } = useNotifier();
  const { data: faction } = useQuery({
    queryKey: ["factions", factionId],
    queryFn: () => apiGetQuery(`/api/factions/${factionId}`),
  });

  const [messagesList, setMessagesList] = useState([]);

  const updateMessageList = useCallback((message) => {
    setMessagesList((msgList) => [message, ...msgList]);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message) => {
      if (message.topicId === topicId) {
        updateMessageList(message);
      }
      notifyIfBlurred(`New message in ${faction.name}`, message.content);
    };

    socket.on("message:recieve", handleMessage);

    return () => {
      socket.off("message:recieve", handleMessage);
    };
  }, [socket, topicId, updateMessageList, faction]);

  useEffect(() => {
    setMessagesList([]);

    fetch(`/api/topics/${topicId}/messages?start=${Date.now() - 604000000}&end=${Date.now()}`)
      .then((messages) => messages.json())
      .then((data) => {
        // messages were returned oldest on bottom, we want the most recent stuff on bottom
        const messageOrder = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMessagesList(messageOrder);
      });
  }, [topicId]);

  return (
    <div className={s.messageListRenderer}>
      {messagesList.map((msg, index) => (
        <Message key={msg.id ?? index} message={msg} />
      ))}
    </div>
  );
}
