import { useState } from "react";
import s from "../styles/modules/InitialFactionForm.module.css";
import { useQueryClient } from "@tanstack/react-query";

export default function CreateTopicForm({ onCreated = () => { }, factionId }) {
    const [name, setName] = useState();
    const queryClient = useQueryClient();

    const createFaction = async () => {
        await fetch(`/api/topics/new`, {
            method: "POST",
            body: JSON.stringify({
                name,
                factionId
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
        <h2>
            Create a new topic
        </h2>
        <div>
            <input type="text" name="name" placeholder="Topic Name" onChange={(e) => setName(e.target.value)} value={name} />
            <button type="submit">Create</button>
        </div>
    </form>
}