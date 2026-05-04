import { lazy, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import UserAvatar from "./UserAvatar";
import s from "../styles/modules/Message.module.css";
import classNames from "classnames";
import remarkGfm from "remark-gfm";
import remarkGemoji from "remark-gemoji";
import Markdown from "react-markdown";
const HoverReactions = lazy(() => import("../components/HoverReactions"));
import { useSocket } from "../components/contexts/SocketContext";
import { useParams } from "@tanstack/react-router";
import twas from "twas";

const isImageUrl = (content = "") => /^https?:\/\/.+\.(png|jpe?g|gif|webp)(\?.*)?$/i.test(content);

export default function Message({ message = {}, hideAuthor = false }) {
  const [expanded, setExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [canAnimateOut, setCanAnimateOut] = useState(false);
  const hideTimerRef = useRef(null);
  const visibleTimerRef = useRef(null);
  const imageMessage = isImageUrl(message.content);
  const { topicId } = useParams({ strict: false });
  const socket = useSocket();

  useEffect(() => {
    if (isHovering) {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      if (visibleTimerRef.current) {
        clearTimeout(visibleTimerRef.current);
        visibleTimerRef.current = null;
      }
      setShowReactions(true);

      visibleTimerRef.current = setTimeout(() => {
        setCanAnimateOut(true);
      }, 950);
    } else {
      if (visibleTimerRef.current) {
        clearTimeout(visibleTimerRef.current);
        visibleTimerRef.current = null;
      }

      if (!canAnimateOut) {
        setShowReactions(false);
      } else {
        hideTimerRef.current = setTimeout(() => {
          setShowReactions(false);
          setCanAnimateOut(false);
        }, 220);
      }
    }
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      if (visibleTimerRef.current) {
        clearTimeout(visibleTimerRef.current);
        visibleTimerRef.current = null;
      }
    };
  }, [canAnimateOut, isHovering]);

  const sendReaction = (emoji) => {
    socket.emit("message:react", {
      messageId: message.id,
      topicId,
      emoji,
    });
  };

  const [existingReactions, setExistingReactions] = useState([]);

  useEffect(() => {
    if (message && existingReactions.length < 1) {
      const existing = [];
      message.reactions.forEach((reaction) => {
        if (reaction.existing && !existingReactions.includes(reaction.emoji)) {
          existing.push(reaction.emoji);
        }
      });
      setExistingReactions(existing);
    }
  }, [message]);

  return (
    <>
      <div
        className={classNames(s.message, hideAuthor ? s.hiddenAuthor : "")}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {showReactions ? <HoverReactions onPick={sendReaction} isVisible={isHovering} /> : ""}
        {hideAuthor ? (
          <div className={s.avatarPlaceholder} />
        ) : (
          <UserAvatar imageUrl={message?.author?.imageUrl} />
        )}

        <div className={s.main}>
          {!hideAuthor && (
            <span className={s.metadata}>
              <p>{message?.author?.nickname || message?.author?.username}</p>
              <p className={s.timestamp} title={twas(new Date(message.createdAt))}>
                {new Date(message.createdAt).toLocaleDateString("en-US", {
                  hour12: true,
                  minute: "numeric",
                  hour: "numeric",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
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
              <Markdown remarkPlugins={[remarkGfm, remarkGemoji]}>{message.content}</Markdown>
            )}
          </div>

          {message.reactions?.length > 0 && (
            <div className={s.reactionsGrid}>
              {Object.entries(
                message.reactions.reduce((acc, r) => {
                  acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                  return acc;
                }, {})
              ).map(([emoji, count]) => {
                return (
                  <div
                    key={emoji}
                    className={classNames(
                      s.reactionChip,
                      existingReactions.includes(emoji) ? s.existing : ""
                    )}
                    onClick={() => sendReaction(emoji)}
                  >
                    <span className={s.emojiInBackground}>{emoji}</span>
                    <span className={s.reactionEmoji}>{emoji}</span>{" "}
                    <span className={s.reactionCounter}>{count}</span>
                  </div>
                );
              })}
            </div>
          )}
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
