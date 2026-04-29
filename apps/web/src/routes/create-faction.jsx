import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/create-faction")({
  component: CreateFactionPage,
});

function CreateFactionPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [channel, setChannel] = useState("general");
  const [icon, setIcon] = useState(null);

  const handleCreate = async () => {
    if (!name.trim()) return;

    try {
      await fetch("http://localhost:3000/api/factions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          ownerId: 1,
        }),
      });

      // after creating, go back home
      navigate({ to: "/" });
    } catch (err) {
      console.error("Failed to create faction:", err);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 12% 10%, rgba(255, 242, 0, 0.14), transparent 18%), radial-gradient(circle at 85% 75%, rgba(255, 242, 0, 0.12), transparent 16%), #050816",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "420px",
          backgroundColor: "#1b2134",
          border: "1px solid #61729c",
          borderRadius: "16px",
          padding: "28px",
          boxShadow: "0 0 30px rgba(0,0,0,0.35)",
        }}
      >
        <h1
          style={{
            color: "#f4e600",
            fontSize: "48px",
            fontWeight: "900",
            marginBottom: "20px",
            textTransform: "uppercase",
            lineHeight: "1",
          }}
        >
          Create a Faction
        </h1>

        {/* Faction Name */}
        <label style={labelStyle}>faction name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Cool Faction"
          style={inputStyle}
        />

        {/* Default Channel */}
        <label style={labelStyle}>default channel name</label>
        <input
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          placeholder="general"
          style={inputStyle}
        />

        {/* Icon Upload */}
        <label style={labelStyle}>icon</label>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              border: "1px solid #69779b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#7c88a8",
              fontSize: "12px",
            }}
          >
            preview
          </div>

          <input
            type="file"
            onChange={(e) => setIcon(e.target.files[0])}
            style={{ color: "#d7dbe8" }}
          />
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            style={{
              backgroundColor: "transparent",
              color: "#d7dbe8",
              fontWeight: "700",
              fontSize: "16px",
              border: "1px solid #69779b",
              borderRadius: "8px",
              padding: "12px 24px",
              cursor: "pointer",
              flex: 1,
            }}
          >
            cancel
          </button>

          <button
            type="button"
            onClick={handleCreate}
            style={{
              backgroundColor: "#f4e600",
              color: "#111",
              fontWeight: "800",
              fontSize: "18px",
              border: "none",
              borderRadius: "8px",
              padding: "12px 28px",
              cursor: "pointer",
              flex: 1,
            }}
          >
            create
          </button>
        </div>
      </div>
    </div>
  );
}

/* Styles */

const labelStyle = {
  display: "block",
  color: "#d7dbe8",
  fontSize: "14px",
  fontWeight: "700",
  marginBottom: "6px",
  marginTop: "10px",
};

const inputStyle = {
  width: "100%",
  backgroundColor: "#050700",
  color: "#ffffff",
  border: "1px solid #69779b",
  borderRadius: "6px",
  padding: "12px 14px",
  fontSize: "16px",
  boxSizing: "border-box",
};
