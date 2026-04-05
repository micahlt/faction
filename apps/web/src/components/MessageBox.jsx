import { useCallback, useState } from "react";
import s from "../styles/modules/MessageBox.module.css";
import { PaperPlaneIcon } from "@phosphor-icons/react";
import { useSocket } from "./contexts/SocketContext";
import { useParams } from "@tanstack/react-router";

export default function MessageBox({ }) {
    const { factionId, topicId } = useParams({ strict: false });
    const [messageText, setMessageText] = useState("");


    const socket = useSocket();

    const sendMessage = () => {
        socket.emit("message:send", {
            content: messageText,
            factionId: factionId,
            topicId: topicId
        });
        setMessageText("");
    };

    const keyUpHandler = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    };

    return <div className={s.messageBox}>
        <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyUp={keyUpHandler} />
        <PaperPlaneIcon weight="duotone" size={28} className={s.sendIcon} onClick={sendMessage} />
    </div>
}