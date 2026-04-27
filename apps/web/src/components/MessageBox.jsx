import { useRef, useState } from "react";
import s from "../styles/modules/MessageBox.module.css";
import { PaperPlaneIcon } from "@phosphor-icons/react";
import { useSocket } from "./contexts/SocketContext";
import { useParams } from "@tanstack/react-router";

export default function MessageBox({ loggedInUser = {} }) {
  const { factionId, topicId } = useParams({ strict: false });
  const [messageText, setMessageText] = useState("");

  const socket = useSocket();
  const typingTimeout = useRef(null);
  const isTyping = useRef(false);

  const stopTyping = () => {
    if (!socket || !factionId || !topicId || !isTyping.current) return;

    socket.emit("typing:stop", {
      factionId,
      topicId,
    });

    isTyping.current = false;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setMessageText(value);

    if (!socket || !factionId || !topicId || !loggedInUser?.id) return;

    if (!isTyping.current) {
      socket.emit("typing:start", {
        factionId,
        topicId,
      });

      isTyping.current = true;
    }

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(stopTyping, 1500);
  };

  const sendMessage = () => {
    if (!messageText.trim() || !socket) return;

    socket.emit("message:send", {
      content: messageText,
      factionId,
      topicId,
    });

    stopTyping();
    setMessageText("");
  };

  const keyUpHandler = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={s.messageBox}>
      <textarea
        value={messageText}
        onChange={handleChange}
        onKeyDown={keyUpHandler}
      />
      <PaperPlaneIcon
        weight="duotone"
        size={28}
        className={s.sendIcon}
        onClick={sendMessage}
      />
    </div>
  );
}