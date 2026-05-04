import { createFileRoute, useNavigate } from "@tanstack/react-router";
import s from "../styles/modules/login.module.css";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import classNames from "classnames";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const getRedirectTarget = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const r = params.get("redirect");
      if (!r) return null;

      // If it's an absolute URL and same-origin, convert to pathname+search+hash
      try {
        const parsed = new URL(r, window.location.origin);
        if (parsed.origin === window.location.origin) {
          return parsed.pathname + parsed.search + parsed.hash;
        }
        // Cross-origin absolute URL
        return r;
      } catch (e) {
        // Not a full URL, treat as path
        return r.startsWith("/") ? r : `/${r}`;
      }
    } catch (e) {
      return null;
    }
  };

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

  const isSignupDisabled = formMode === "signup" && usernameStatus !== "valid";

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
        const res = await fetch(`/api/auth/checkusername?username=${encodeURIComponent(trimmed)}`);

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
      const target = getRedirectTarget();
      if (target) {
        if (target.startsWith("http://") || target.startsWith("https://")) {
          window.location.href = target;
        } else {
          window.location.href = target;
        }
        return;
      }

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
      const target = getRedirectTarget();
      if (target) {
        if (target.startsWith("http://") || target.startsWith("https://")) {
          window.location.href = target;
        } else {
          window.location.assign(target);
        }
        return;
      }

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
            className={usernameStatus === "invalid" ? s.errorText : undefined}
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
          className={classNames(s.submitButton, isSignupDisabled ? s.signupDisabled : "")}
        >
          {formMode === "login" ? "Log In" : "Sign Up"}
        </button>

        {loginError && <p className={s.errorText}>{loginError}</p>}

        <p className={s.switchMode}>
          {formMode === "login" ? "Don't have an account? " : "Already have an account? "}
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
