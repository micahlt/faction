import { useQuery } from "@tanstack/react-query";
import apiGetQuery from "../utils/api/apiGetQuery";
import UserAvatar from "./UserAvatar";
import s from "../styles/modules/UserListPanel.module.css";

//Queries the factin for its users and displays them in a list in its own unique panel..
//..to the right of the messages panel.
export default function UserListPanel({ factionId }) {
    const { data: faction = {}, isLoading, error } = useQuery({
        queryKey: ["factionUsers", factionId],
        queryFn: () => apiGetQuery(`/api/factions/${factionId}?topics=true`),
    });

    const users = faction.members || [];

    //minor error handling, could be expanded on later.
    if (isLoading) return <div className={s.UserListPanel}>Loading...</div>;
    if (error) return <div className={s.UserListPanel}>Error loading users</div>;

    //TODO: I want to show online status with a green or empty circle to the right of thier name
    //TODO: there should be some functionality to click on a user and view thier profile/send them a DM?
    //TODO: if roles are ever added some sorting/indicator should be added here too.s
    return (
        <div className={s.UserListPanel}>
            <h3>Users in this faction</h3>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>
                        <UserAvatar size="sm" imageUrl={user.imageUrl}/>
                        <span>{user.username}</span>
                        <!-- This is where the online status indicator should go. -->
                    </li>
                ))}
            </ul>
        </div>
    );
}
