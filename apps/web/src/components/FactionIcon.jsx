import s from "../styles/modules/FactionIcon.module.css";

export default function FactionIcon({ faction = {}, isSelected = false }) {
    return (
        <div className={s.factionIcon} style={{ borderColor: isSelected ? "var(--clr-primary)" : "var(--clr-surface-tonal-30)" }}>
            {faction.iconUrl ? <img src={faction.iconUrl} /> :
                <span className={s.letter}>{faction.name[0]}</span>}
        </div>
    );
}
