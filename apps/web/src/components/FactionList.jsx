import { useNavigate } from "@tanstack/react-router";
import s from "../styles/modules/FactionList.module.css";
import FactionIcon from "./FactionIcon";
import { createPortal } from "react-dom";
import StepsModal from "./StepsModal";
import InitialFactionForm from "./InitialFactionForm";
import { useState } from "react";

export default function FactionList({ factions = [], currentFaction = {} }) {
  const nav = useNavigate();
  const [isCreatingFaction, setIsCreatingFaction] = useState(false);

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
      <a href="#" className={s.newFaction} onClickCapture={(e) => {
        e.preventDefault();
        setIsCreatingFaction(true);
      }}>+</a>
      {isCreatingFaction ? createPortal(<StepsModal steps={[{
        title: "Create a new faction",
        component: <InitialFactionForm onCreated={() => setIsCreatingFaction(false)} />,
        showCompleteButton: false
      }]} />, document.body) : <></>}
    </div>
  );
}
