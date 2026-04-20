import UserAvatar from "./UserAvatar";
import s from "../styles/modules/Message.module.css";

export default function Message({ message = {} }) {
    return <div className={s.message}>
        <UserAvatar imageUrl={message?.author?.imageUrl} />
        <div className={s.main}>
            <span className={s.metadata}>
                <p>{message.author.nickname}</p>
                <p className={s.date}>{message.createdAt.toLocaleString()}</p>
            </span>
            <div className={s.content}>
                {message.content}
            </div>
        </div>
    </div>
}