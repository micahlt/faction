import { useEffect, useState } from "react";

export default function useDoesHaveAdmin(factionId) {
  const [hasAdmin, setHasAdmin] = useState(false);

  useEffect(() => {
    fetch(`/api/factions/${factionId}/perms`)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          return {
            owner: false,
          };
        }
      })
      .then((data) => {
        setHasAdmin(data.owner);
      });
  }, [factionId]);

  return hasAdmin;
}
