import { useState } from "react";
import s from "../styles/modules/InitialFactionForm.module.css";
import { useQueryClient } from "@tanstack/react-query";

export default function CreateTopicForm({ onCreated = () => { }, factionId }) {
  const [expiration, setExpiration] = useState();
  const [code, setCode] = useState("");
  const queryClient = useQueryClient();

  const createFaction = async () => {
    const res = await fetch(`/api/factions/${factionId}/invite`, {
      method: "POST",
      body: JSON.stringify({
        expiresAt: expiration,
        factionId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    setCode(data.code);
    queryClient.invalidateQueries();
    // onCreated();
  };

  return (
    <form
      className={s.initialFactionForm}
      onSubmitCapture={(e) => {
        e.preventDefault();
        createFaction();
      }}
    >
      <h2>Invite a user to this faction</h2>
      <div>
        <p>Invite expiry: </p>
        <input
          type="date"
          name="expiration"
          placeholder="Expiration"
          onChange={(e) => setExpiration(e.target.value)}
          value={expiration}
        />
        <br />
        <button type="submit">Invite</button>
        {code && (
          <input
            type="text"
            disabled
            value={`${window.location.origin}/invite/${code}`}
          />
        )}
      </div>
    </form>
  );
}
