import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/app")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>The Faction app UI goes here.</div>;
}
