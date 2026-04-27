import s from "../styles/modules/FactionIcon.module.css";
import classNames from "classnames";

export default function FactionIcon({ faction = {}, isSelected = false, onClick = () => { } }) {
  return (
    <div
      onClick={onClick}
      title={faction.name}
      className={classNames(s.factionIcon, isSelected ? s.selected : "")}
    >
      {faction.iconUrl ? (
        <img src={faction.iconUrl} />
      ) : (
        <span className={s.letter}>{faction.name[0].toUpperCase()}</span>
      )}
    </div>
  );
}
