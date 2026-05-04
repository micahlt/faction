import { useCallback, useState } from "react";
import s from "../styles/modules/CreateInviteForm.module.css";
import { useQueryClient } from "@tanstack/react-query";

export default function CreateInviteForm({ onCreated = () => {}, factionId }) {
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
  };

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${code}`);
  }, [code]);

  return (
    <form
      className={s.createInviteForm}
      onSubmitCapture={(e) => {
        e.preventDefault();
        createFaction();
      }}
    >
      <div className={s.title}>
        <h2>
          Invite a user to
          <br />
          this faction.
        </h2>
      </div>
      {!code ? (
        <div className={s.content}>
          <div>
            <p>
              Invite expires on{" "}
              <input
                type="date"
                name="expiration"
                placeholder="Expiration"
                onChange={(e) => setExpiration(e.target.value)}
                value={expiration}
              />
            </p>
            <button type="submit">Invite</button>
          </div>
        </div>
      ) : (
        <div className={s.content}>
          <div className={s.copyView}>
            <p>
              Send this invite to your friends <br />
              to let them join your faction!
            </p>
            <input type="text" disabled value={`${window.location.origin}/invite/${code}`} />
            <button onClick={copyCode}>Copy to clipboard</button>
          </div>
        </div>
      )}
    </form>
  );
}
