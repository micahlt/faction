import sampleMessageObject from "../utils/sampleMessageObject";
import Message from "./Message";
import s from "../styles/modules/MessageListRenderer.module.css";

export default function MessageListRenderer({ factionId = "", topic = {} }) {
    return <div className={s.messageListRenderer}>{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28].map((index, i) => <Message key={index} message={sampleMessageObject} />)}
    </div>;
}