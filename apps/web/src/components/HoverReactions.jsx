import classNames from "classnames";
import s from "../styles/modules/HoverReactions.module.css";

const emojiOptions = ["♥️", "🔥", "👍", "👎", "💀", "😂"]

export default function HoverReactions({
    onPick = () => { },
    isVisible = false,
}) {
    return <div className={classNames(s.hoverReactions, isVisible ? s.open : s.closing)}>
        {emojiOptions.map((emoji) => <span key={emoji} className={s.reaction} onClick={() => onPick(emoji)}>{emoji}</span>)}
    </div>
}