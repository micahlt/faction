import Message from "./Message";
import s from "../styles/modules/MessageListRenderer.module.css";
import { useSocket } from "./contexts/SocketContext";
import { useCallback, useEffect, useState } from "react";
import useNotifier from "../hooks/useNotifier";
import { useQuery } from "@tanstack/react-query";
import apiGetQuery from "../utils/api/apiGetQuery";

function removeDuplicates(arr) {
  const map = new Map(
    arr.map(item => [item.id, item]));
  return [...map.values()];
}

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
  const [messagesCursor, setMessagesCursor] = useState("");
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(true);
  const [noMoreMessages, setNoMoreMessages] = useState(false);

  const updateMessageList = useCallback((message) => {
    setMessagesList((msgList) => [message, ...msgList]);
  }, []);

  const handleScroll = useCallback((e) => {
    if (noMoreMessages) return;
    const el = e.target;
    const END_THRESHOLD = 50;
    const isAtEnd = el.scrollHeight - el.offsetHeight + el.scrollTop < END_THRESHOLD;
    if (isAtEnd && messagesCursor != "" && !loadingOlderMessages) {
      setLoadingOlderMessages(true);
      fetch(`/api/topics/${topicId}/messages?last=${messagesCursor}`)
        .then((messages) => messages.json())
        .then((data) => {
          const newMessages = data.messages;
          console.log("Loading older from", messagesCursor)
          setMessagesList((oldMessages) => {
            return removeDuplicates([...oldMessages, ...newMessages]);
          });
          if (newMessages.length > 0) {
            setMessagesCursor(newMessages[newMessages.length - 1].id);
          }
          setNoMoreMessages(data.end);
          setTimeout(() => {
            setLoadingOlderMessages(false);
          }, 500);
        });
    }
  }, [messagesCursor, loadingOlderMessages, setMessagesList, setMessagesCursor]);

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
    fetch(`/api/topics/${topicId}/messages`)
      .then((messages) => messages.json())
      .then((data) => {
        const messages = data.messages;
        setMessagesList(messages);
        setLoadingOlderMessages(false);
        setNoMoreMessages(data.end)
        if (messages.length > 0) {
          setMessagesCursor(messages[messages.length - 1].id);
        }
      });
  }, [topicId]);

  useEffect(() => {
    console.log("Message list updated");
  }, [messagesList])

  if (!topic) return <></>

  return (
    <div className={s.messageListRenderer} onScroll={handleScroll}>
      {messagesList.map((msg, index) => {
        const previousMessage = messagesList[index + 1];
        const hideAuthor = previousMessage?.author?.id === msg.author?.id;

        return <Message key={msg.id ?? index} message={msg} hideAuthor={hideAuthor} />;
      })}
      {noMoreMessages && <div className={s.beginning}>
        <span className={s.line}></span>
        <span>This is the beginning of <b>{topic.name}</b>.</span>
        <span className={s.line}></span>
      </div>}
    </div>
  );
}
