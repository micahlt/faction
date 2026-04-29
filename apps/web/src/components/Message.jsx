import { useState } from "react";
import UserAvatar from "./UserAvatar";
import s from "../styles/modules/Message.module.css";

const isImageUrl = (content = "") => /^https?:\/\/.+\.(png|jpe?g|gif|webp)(\?.*)?$/i.test(content);

export default function Message({ message = {} }) {
  const [expanded, setExpanded] = useState(false);
  const imageMessage = isImageUrl(message.content);

  return (
    <div className={s.message}>
      <UserAvatar imageUrl={message?.author?.imageUrl} />

      <div className={s.main}>
        <span className={s.metadata}>
          <p>{message.author.nickname}</p>
          <p className={s.date}>
            {new Date().toLocaleString("en-US", {
              hour12: true,
              minute: "numeric",
              hour: "numeric",
            })}
          </p>
        </span>

        <div className={s.content}>
          {imageMessage ? (
            <img
              src={message.content}
              alt="Sent attachment"
              className={s.messageImage}
              onClick={() => setExpanded(true)}
            />
          ) : (
            message.content
          )}
        </div>
      </div>

      {expanded && (
        <div className={s.lightbox} onClick={() => setExpanded(false)}>
          <img src={message.content} alt="Expanded attachment" />
        </div>
      )}
    </div>
  );
}
