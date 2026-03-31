import s from "../styles/modules/FactionList.module.css";
import FactionIcon from "./FactionIcon";

export default function FactionList({ factions = [], currentFaction = {} }) {
  return (
    <div className={s.factionList}>
      <div className={s.logo}>
        <span>FC</span>
        <span>TN</span>
      </div>
      <div className={s.list}>
        {factions.map((faction) => (
          <FactionIcon faction={faction} key={faction.id} isSelected={currentFaction?.id == faction.id} />
        ))}
      </div>
    </div>
  );
}
