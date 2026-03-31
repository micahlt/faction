import s from "../styles/modules/TopicListItem.module.css";

export default function TopicListItem({ topic = {} }) {
    return <div className={s.topicListItem}>{topic.name}</div>
}