import Message from "./Message";
import s from "../styles/modules/MessageListRenderer.module.css";
import { useSocket } from "./contexts/SocketContext";
import { useCallback, useEffect, useState } from "react";
import useNotifier from "../hooks/useNotifier";
import { useQuery } from "@tanstack/react-query";
import apiGetQuery from "../utils/api/apiGetQuery";

export default function MessageListRenderer({ factionId = "", topicId = "" }) {
  const socket = useSocket();
  const { notify } = useNotifier();
  const { data: faction } = useQuery({
    queryKey: ["factions", factionId],
    queryFn: () => apiGetQuery(`/api/factions/${factionId}`),
  });
  const { data: topic, status } = useQuery({
    queryKey: ["topics", topicId],
    queryFn: () => apiGetQuery(`/api/topics/${topicId}`),
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
      notify(
        `Message from ${message.author.username} (${faction.name}, #${topic.name})`,
        message.content,
        message.author.imageUrl
      );
    };

    const handleUpdateReaction = ({ messageId, reactions }) => {
      setMessagesList((msgList) => {
        return msgList.map((msg) => {
          if (msg.id === messageId) {
            return {
              ...msg,
              reactions: reactions,
            };
          }
          return msg;
        });
      });
    };

    socket.on("message:recieve", handleMessage);
    socket.on("message:update_react", handleUpdateReaction);

    return () => {
      socket.off("message:recieve", handleMessage);
      socket.off("message:update_react", handleUpdateReaction);
    };
  }, [socket, topicId, updateMessageList, faction, topic]);

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
      {messagesList.map((msg, index) => {
        const previousMessage = messagesList[index + 1];
        const hideAuthor = previousMessage?.author?.id === msg.author?.id;

        return <Message key={msg.id ?? index} message={msg} hideAuthor={hideAuthor} />;
      })}
    </div>
  );
}
