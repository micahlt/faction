import { Outlet, createFileRoute } from "@tanstack/react-router";
import FactionSidebar from "../../../components/FactionSidebar";

export const Route = createFileRoute("/_authenticated/app/$factionId")({
    component: RouteComponent,
});

function RouteComponent() {
    const { factionId } = Route.useParams();

    return (
        <>
            <FactionSidebar factionId={factionId} />
            <Outlet />
        </>
    );
}
