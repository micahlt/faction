import { useNavigate } from "@tanstack/react-router";
import s from "../styles/modules/FactionList.module.css";
import FactionIcon from "./FactionIcon";

export default function FactionList({ factions = [], currentFaction = {} }) {
  const nav = useNavigate();
  const setCurrentFaction = (id) => {
    nav({
      to: "/app/$factionId",
      params: {
        factionId: id
      }
    })
  };

  return (
    <div className={s.factionList}>
      <div className={s.logo}>
        <span>FC</span>
        <span>TN</span>
      </div>
      <div className={s.list}>
        {factions.map((faction) => (
          <FactionIcon faction={faction} key={faction.id} isSelected={currentFaction?.id == faction.id} onClick={() => setCurrentFaction(faction.id)} />
        ))}
      </div>
    </div>
  );
}
