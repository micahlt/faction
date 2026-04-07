import classNames from "classnames";
import { Link } from "@tanstack/react-router";
import s from "../styles/modules/TopicListItem.module.css";

export default function TopicListItem({ topic = {}, active = false }) {
    return <Link className={classNames(s.topicListItem, active ? s.active : "")} to={`/app/${topic.factionId}/${topic.id}`}>{topic.name}</Link>
}