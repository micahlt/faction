import Message from "./Message";
import s from "../styles/modules/MessageListRenderer.module.css";
import { useSocket } from "./contexts/SocketContext";
import { useCallback, useEffect, useState } from "react";

export default function MessageListRenderer({ factionId = "", topicId = "" }) {
  const socket = useSocket();
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
    };

    socket.on("message:recieve", handleMessage);

    return () => {
      socket.off("message:recieve", handleMessage);
    };
  }, [socket, topicId, updateMessageList]);

  useEffect(() => {
    setMessagesList([]);

    fetch(`/api/topics/${topicId}/messages?start=${Date.now() - 604000000}&end=${Date.now()}`)
      .then((messages) => messages.json())
      .then((data) => {
        setMessagesList(data);
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
