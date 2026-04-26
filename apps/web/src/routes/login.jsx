import { createFileRoute, useNavigate } from "@tanstack/react-router";
import s from "../styles/modules/login.module.css";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [formMode, setFormMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [loginError, setLoginError] = useState("");

  const [usernameStatus, setUsernameStatus] = useState("idle"); // idle | checking | valid | invalid
  const [usernameMessage, setUsernameMessage] = useState("");

  const nav = useNavigate();
  const queryClient = useQueryClient();

  const isSignupDisabled =
    formMode === "signup" && usernameStatus !== "valid";

  // Debounced username check
  useEffect(() => {
    if (formMode !== "signup") {
      setUsernameStatus("idle");
      setUsernameMessage("");
      return;
    }

    const trimmed = username.trim();

    if (!trimmed) {
      setUsernameStatus("idle");
      setUsernameMessage("");
      return;
    }

    setUsernameStatus("checking");
    setUsernameMessage("Checking username...");

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/auth/checkusername?username=${encodeURIComponent(trimmed)}`
        );

        if (res.ok) {
          setUsernameStatus("valid");
          setUsernameMessage("Username is available.");
        } else {
          const json = await res.json();
          setUsernameStatus("invalid");
          setUsernameMessage(json?.error || "Username is not available.");
        }
      } catch {
        setUsernameStatus("invalid");
        setUsernameMessage("Failed to check username.");
      }
    }, 700);

    return () => clearTimeout(timeout);
  }, [username, formMode]);

  const logIn = async (e) => {
    e.preventDefault();

    const loginReq = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (loginReq.ok) {
      nav({ to: "/app", from: "/" });
    } else {
      const json = await loginReq.json();
      if (json?.error) {
        setLoginError(json.error);
      }
    }
  };

  const signUp = async (e) => {
    e.preventDefault();

    if (usernameStatus !== "valid") {
      setLoginError("Please choose a valid username.");
      return;
    }

    const signupReq = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email,
        username,
        password,
        nickname,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (signupReq.ok) {
      queryClient.invalidateQueries();
      nav({ to: "/app", reloadDocument: true });
    } else {
      const json = await signupReq.json();
      if (json?.error) {
        setLoginError(json.error);
      }
    }
  };

  return (
    <main className={s.main}>
      <form
        className={s.loginContainer}
        onSubmitCapture={(e) => {
          if (formMode === "login") {
            logIn(e);
          } else {
            signUp(e);
          }
        }}
      >
        <h2>Faction</h2>

        {formMode === "signup" && (
          <>
            <input
              type="email"
              name="Email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            <br />

            <input
              type="text"
              name="Nickname"
              placeholder="Nickname"
              onChange={(e) => setNickname(e.target.value)}
              value={nickname}
            />
            <br />
          </>
        )}

        <input
          type="text"
          name="Username"
          placeholder="Username"
          onChange={(e) => {
            setUsername(e.target.value);
            setLoginError("");
          }}
          value={username}
        />

        {formMode === "signup" && usernameMessage && (
          <p
            className={
              usernameStatus === "invalid" ? s.errorText : undefined
            }
            style={{
              color:
                usernameStatus === "valid"
                  ? "green"
                  : usernameStatus === "checking"
                    ? "#777"
                    : undefined,
              margin: "4px 0",
              fontSize: "14px",
            }}
          >
            {usernameMessage}
          </p>
        )}

        <br />

        <input
          type="password"
          name="Password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />

        <button
          type="submit"
          disabled={isSignupDisabled}
          style={{
            backgroundColor: isSignupDisabled ? "#555" : "#f4e600",
            color: isSignupDisabled ? "#999" : "#111",
            cursor: isSignupDisabled ? "not-allowed" : "pointer",
            opacity: isSignupDisabled ? 0.6 : 1,
          }}
        >
          {formMode === "login" ? "Log In" : "Sign Up"}
        </button>

        {loginError && <p className={s.errorText}>{loginError}</p>}

        <p className={s.switchMode}>
          {formMode === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setLoginError("");
              setUsernameStatus("idle");
              setUsernameMessage("");

              if (formMode === "login") {
                setFormMode("signup");
              } else {
                setFormMode("login");
              }
            }}
          >
            {formMode === "login" ? "Sign up." : "Log in."}
          </a>
        </p>
      </form>
    </main>
  );
}