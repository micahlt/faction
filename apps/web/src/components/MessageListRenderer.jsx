import sampleMessageObject from "../utils/sampleMessageObject";
import Message from "./Message";
import s from "../styles/modules/MessageListRenderer.module.css";
import { useSocket } from "./contexts/SocketContext";
import { useCallback, useEffect, useState } from "react";

export default function MessageListRenderer({ factionId = "", topicId = {} }) {
    const socket = useSocket();
    const [messagesList, setMessagesList] = useState([]);

    const updateMessageList = useCallback((message) => {
        setMessagesList(msgList => {
            return [...msgList, message];
        })
    }, [messagesList, setMessagesList])

    useEffect(() => {
        console.log("registering")
        socket.on("message:recieve", (message) => {
            console.log(message);
            if (message.topicId === topicId) {
                updateMessageList(message)
            }
        });
        return () => socket.off("message:recieve");
    }, []);

    useEffect(() => console.log(messagesList), [messagesList])

    return <div className={s.messageListRenderer}>{messagesList.map((msg, index) => <Message key={index} message={msg} />)}
    </div>;
}