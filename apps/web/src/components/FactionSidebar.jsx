import { useQuery } from "@tanstack/react-query";
import s from "../styles/modules/FactionSidebar.module.css";
import apiGetQuery from "../utils/api/apiGetQuery";
import TopicListItem from "./TopicListItem";

export default function FactionSidebar({ factionId = "" }) {
    const {
        data: faction,
        error: factionError,
        isLoading: factionLoading,
    } = useQuery({
        queryKey: ["factions", factionId],
        queryFn: () => apiGetQuery(`/api/factions/${factionId}?topics=true`),
    });

    return <div className={s.factionSidebar}>
        {faction && !factionError && <>
            <span className={s.factionPretitle}>FACTION</span>
            <h2>{faction?.name}</h2>
            <div className={s.topicsList}>
                {faction.topics.map((topic) => <TopicListItem topic={topic} />)}
            </div>
        </>}
    </div>
}