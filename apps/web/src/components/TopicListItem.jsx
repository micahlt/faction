import classNames from "classnames";
import s from "../styles/modules/TopicListItem.module.css";

export default function TopicListItem({ topic = {}, active = false }) {
    return <div className={classNames(s.topicListItem, active ? s.active : "")}>{topic.name}</div>
}