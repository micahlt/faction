import { useState } from "react";
import { createPortal } from "react-dom";
import UserAvatar from "./UserAvatar";
import s from "../styles/modules/Message.module.css";
import classNames from "classnames";
import { LinkItUrl } from "react-linkify-it"

const isImageUrl = (content = "") => /^https?:\/\/.+\.(png|jpe?g|gif|webp)(\?.*)?$/i.test(content);

export default function Message({ message = {}, hideAuthor = false }) {
  const [expanded, setExpanded] = useState(false);
  const imageMessage = isImageUrl(message.content);

  return (
    <>
      <div className={classNames(s.message, hideAuthor ? s.hiddenAuthor : "")}>
        {hideAuthor ? <div className={s.avatarPlaceholder} /> : <UserAvatar imageUrl={message?.author?.imageUrl} />}

        <div className={s.main}>
          {!hideAuthor && (
            <span className={s.metadata}>
              <p>{message.author.nickname}</p>
              <p className={s.date}>
                {new Date(message.createdAt).toLocaleString("en-US", {
                  hour12: true,
                  minute: "numeric",
                  hour: "numeric",
                })}
              </p>
            </span>
          )}

          <div className={s.content}>
            {imageMessage ? (
              <img
                src={message.content}
                alt="Sent attachment"
                className={s.messageImage}
                onClick={() => setExpanded(true)}
              />
            ) : (
              <LinkItUrl className={s.contentLink}>
                {message.content}
              </LinkItUrl>
            )}
          </div>
        </div>
      </div>

      {expanded &&
        createPortal(
          <div className={s.lightbox} onClick={() => setExpanded(false)}>
            <img src={message.content} alt="Expanded attachment" />
          </div>,
          document.getElementById("portal-root")
        )}
    </>
  );
}
