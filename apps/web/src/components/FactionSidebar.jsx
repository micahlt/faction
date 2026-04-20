import { useQuery } from "@tanstack/react-query";
import s from "../styles/modules/FactionSidebar.module.css";
import apiGetQuery from "../utils/api/apiGetQuery";
import TopicListItem from "./TopicListItem";
import { PlusIcon } from "@phosphor-icons/react";
import { useParams } from "@tanstack/react-router";

export default function FactionSidebar({ factionId = "" }) {
    const {
        data: faction,
        error: factionError,
        isLoading: factionLoading,
    } = useQuery({
        queryKey: ["factions", factionId],
        queryFn: () => apiGetQuery(`/api/factions/${factionId}?topics=true`),
    });
    const { topicId } = useParams({ strict: false });

    console.log(topicId)
    return <div className={s.factionSidebar}>
        {faction && !factionError && <>
            <span className={s.factionPretitle}>FACTION</span>
            <h2>{faction?.name}</h2>
            <div className={s.topicsList}>
                {faction.topics.map((topic) => <TopicListItem topic={topic} active={topic.id === topicId} />)}
            </div>
            <a href="#" className={s.createTopic}>
                <PlusIcon /> Create Topic</a>
        </>}
    </div>
}