import { useState } from "react";
import s from "../styles/modules/MessageBox.module.css";
import { PaperPlaneIcon } from "@phosphor-icons/react";

export default function MessageBox({ }) {
    const [messageText, setMessageText] = useState("");
    return <div className={s.messageBox}>
        <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} />
        <PaperPlaneIcon weight="duotone" size={28} className={s.sendIcon} />
    </div>
}