import UserAvatar from "./UserAvatar";
import s from "../styles/modules/Message.module.css";

export default function Message({ message = {} }) {
  return (
    <div className={s.message}>
      <UserAvatar imageUrl={message?.author?.imageUrl} />
      <div className={s.main}>
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
        <div className={s.content}>{message.content}</div>
      </div>
    </div>
  );
}
