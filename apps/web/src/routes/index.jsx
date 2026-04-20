import { createFileRoute, Link } from "@tanstack/react-router";
import "../styles/pages/landing.css";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/">About</Link>
        <a href="https://github.com/micahlt/faction">GitHub</a>
        <Link to="/app">Open App</Link>
      </nav>
      <main>
        <div className="cta">
          <div className="cta-content">
            <h1>Faction</h1>
            <h2>A chat app for the modern self-hosted era</h2>
          </div>
        </div>
      </main>
    </>
  );
}
