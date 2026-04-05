import { Outlet, createFileRoute } from "@tanstack/react-router";
import FactionSidebar from "../../../components/FactionSidebar";
import { useSocket } from "../../../components/contexts/SocketContext";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/app/$factionId")({
    component: RouteComponent,
});

function RouteComponent() {
    console.log("AT FACTIONID")
    const { factionId } = Route.useParams();

    const socket = useSocket();
    useEffect(() => {
        socket.emit("faction:join", factionId)
        return () => {
            socket.emit("faction:leave", factionId);
        }
    }, [factionId]);

    return (
        <>
            <FactionSidebar factionId={factionId} />
            <Outlet />
        </>
    );
}
