import { useQuery } from "@tanstack/react-query";
import apiGetQuery from "../utils/api/apiGetQuery";
import { useSocket } from "./contexts/SocketContext";
import UserAvatar from "./UserAvatar";
import s from "../styles/modules/UserList.module.css";
import { useEffect, useState } from "react";
import { CaretLineRightIcon } from "@phosphor-icons/react";

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
  const [awayUserIds, setAwayUserIds] = useState(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const users = faction.members || [];

  const sortedUsers = [...users].sort((a, b) => {
    const aOnline = onlineUserIds.has(a.id);
    const bOnline = onlineUserIds.has(b.id);
    if (aOnline === bOnline) {
      return a.username.localeCompare(b.username);
    }
    return aOnline ? -1 : 1;
  });

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

    // listener for away satus
    socket.on("user:away", ({ userId }) => {
      setAwayUserIds((prev) => new Set(prev).add(userId));
    });

    // listener for back status
    socket.on("user:back", ({ userId }) => {
      setAwayUserIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    return () => {
      socket.off("user:online");
      userTimeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [socket, factionId]);

  //minor error handling, could be expanded on later.
  if (isLoading)
    return (
      <div className={`${s.container}`}>
        <div className={s.UserListPanel}>Loading...</div>
      </div>
    );
  if (error)
    return (
      <div className={`${s.Container}`}>
        <div className={s.UserListPanel}>Error loading users</div>
      </div>
    );

  //TODO: Ideally there should be an AFK/Idle indicator as well.
  //TODO: there should be some functionality to click on a user and view thier profile/send them a DM?
  //TODO: if roles are ever added some sorting/indicator should be added here too.
  return (
    <div className={s.container}>
      <button
        className={`${s.toggleBtn} ${isCollapsed ? s.collapsedBtn : ""}`}
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Show Users" : "Hide Users"}
      >
        <CaretLineRightIcon size={20} />
      </button>
      <div className={`${s.userListPanel} ${isCollapsed ? s.collapsed : ""}`}>
        <h3>Users</h3>
        <ul>
          {sortedUsers.map((user) => (
            <li key={user.id}>
              <UserAvatar
                size="sm"
                imageUrl={user.imageUrl}
                isAway={awayUserIds.has(user.id)}
                isOnline={onlineUserIds.has(user.id)}
                showActivityStatus={true}
              />
              <div>
                <p className={s.username}>{user.username}</p>
                <span>{user.nickname}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
