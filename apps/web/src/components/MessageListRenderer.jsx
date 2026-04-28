import Message from "./Message";
import s from "../styles/modules/MessageListRenderer.module.css";
import { useSocket } from "./contexts/SocketContext";
import { useCallback, useEffect, useState } from "react";

export default function MessageListRenderer({ factionId = "", topicId = "" }) {
  const socket = useSocket();
  const [messagesList, setMessagesList] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

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
    if (!socket) return;

    const handleTypingStart = ({ topicId: typingTopicId, user }) => {
      if (typingTopicId !== topicId || !user?.id) return;

      setTypingUsers((users) => {
        if (users.some((existingUser) => existingUser.id === user.id)) {
          return users;
        }

        return [...users, user];
      });
    };

    const handleTypingStop = ({ topicId: typingTopicId, userId }) => {
      if (typingTopicId !== topicId || !userId) return;

      setTypingUsers((users) => users.filter((user) => user.id !== userId));
    };

    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);

    return () => {
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
    };
  }, [socket, topicId]);

  useEffect(() => {
    setMessagesList([]);
    setTypingUsers([]);

    fetch(
      `/api/topics/${topicId}/messages?start=${
        Date.now() - 604000000
      }&end=${Date.now()}`
    )
      .then((messages) => messages.json())
      .then((data) => {
        setMessagesList(data);
      });
  }, [topicId]);

  const typingText = getTypingText(typingUsers);

  return (
    <div className={s.messageListRenderer}>
      {typingText && <div className={s.typingIndicator}>{typingText}</div>}

      {messagesList.map((msg, index) => (
        <Message key={msg.id ?? index} message={msg} />
      ))}
    </div>
  );
}

function getTypingText(users) {
  const names = users.map((user) => user.nickname || user.username);

  if (names.length === 0) return "";
  if (names.length === 1) return `${names[0]} is typing...`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;

  return `${names[0]}, ${names[1]}, and ${names.length - 2} others are typing...`;
}