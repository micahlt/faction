import { useQuery } from "@tanstack/react-query";
import apiGetQuery from "../utils/api/apiGetQuery";
import { useSocket } from "./contexts/SocketContext";
import UserAvatar from "./UserAvatar";
import s from "../styles/modules/UserListPanel.module.css";
import { useEffect, useState } from "react";

//Queries the faction for its users and displays them in a list in its own unique panel..
//..to the right of the messages panel.
export default function UserListPanel({ factionId }) {
  const {
    data: faction = {},
    isLoading,
    error,
  } = useQuery({
    queryKey: ["factionUsers", factionId],
    queryFn: () => apiGetQuery(`/api/factions/${factionId}?topics=true`),
  });

  const socket = useSocket();
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const users = faction.members || [];


  useEffect(() => {
    if (!socket) return;

    const userTimeouts = new Map();

    const handleUserOnline = ({ userId }) => {
      setOnlineUserIds((prev) => new Set(prev).add(userId));

      //clears any previous timeouts if they exist
      if (userTimeouts.has(userId)) {
        clearTimeout(userTimeouts.get(userId));
      }

      //user goes offline after 30 seconds of no alive ping
      const timeout = setTimeout(() => {
        setOnlineUserIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
        userTimeouts.delete(userId);
      }, 30000);

      userTimeouts.set(userId, timeout);
    };

    // the actual listener for when someone comes online
    socket.on("user:online", handleUserOnline);

    return () => {
      socket.off("user:online");
      userTimeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [socket, factionId]);

  //minor error handling, could be expanded on later.
  if (isLoading) return <div className={s.UserListPanel}>Loading...</div>;
  if (error) return <div className={s.UserListPanel}>Error loading users</div>;

  //TODO: Ideally there should be an AFK/Idle indicator as well.
  //TODO: there should be some functionality to click on a user and view thier profile/send them a DM?
  //TODO: if roles are ever added some sorting/indicator should be added here too.s
  return (
    <div className={s.UserListPanel}>
      <h3>Users in this faction</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <UserAvatar size="sm" imageUrl={user.imageUrl} />
            <span>{user.username}</span>
            <span className={onlineUserIds.has(user.id) ? s.onlineIndicator : s.offlineIndicator}></span>
          </li>
        ))}
      </ul>
    </div>
  );
}
