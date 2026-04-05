import { useState } from "react";
import s from "../styles/modules/InitialFactionForm.module.css";
import { useQueryClient } from "@tanstack/react-query";

export default function InitialFactionForm({ onCreated = () => { } }) {
    const [name, setName] = useState();
    const queryClient = useQueryClient();

    const createFaction = async () => {
        await fetch(`/api/factions/new`, {
            method: "POST",
            body: JSON.stringify({
                name
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        queryClient.invalidateQueries();
        onCreated();
    }

    return <form className={s.initialFactionForm} onSubmitCapture={(e) => {
        e.preventDefault();
        createFaction();
    }}>
        <input type="text" name="name" placeholder="Faction Name" onChange={(e) => setName(e.target.value)} value={name} />
        <br />
        <button type="submit">Create</button>
    </form>
}