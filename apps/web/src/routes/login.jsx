import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import s from "../styles/modules/login.module.css";
import { useState } from "react";
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
  const nav = useNavigate();
  const queryClient = useQueryClient();

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
      nav({
        to: "/app",
        from: "/"
      });
    } else {
      const json = await loginReq.json();
      if (json && json.error) {
        setLoginError(json.error);
      }
    }
  };

  const signUp = async (e) => {
    e.preventDefault();
    const signupReq = await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email,
        username,
        password,
        nickname
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (signupReq.ok) {
      queryClient.invalidateQueries();
      nav({
        to: "/app",
        reloadDocument: true,
      });
    } else {
      const json = await signupReq.json();
      if (json && json.error) {
        setLoginError(json.error);
      }
    }
  };

  return (
    <main className={s.main}>
      <form
        className={s.loginContainer}
        onSubmitCapture={(e) => {
          if (formMode == "login") {
            logIn(e);
          } else {
            signUp(e);
          }
        }}
      >
        <h2>Faction</h2>
        {formMode == "signup" && (
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
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
        <br />
        <input
          type="password"
          name="Password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
        <button type="submit">{formMode == "login" ? "Log In" : "Sign Up"}</button>
        {loginError && <p className={s.errorText}>{loginError}</p>}
        <p className={s.switchMode}>
          {formMode == "login" ? "Don't have an account? " : "Already have an account? "}
          <a
            href="#"
            onClick={() => {
              if (formMode == "login") {
                setFormMode("signup");
              } else setFormMode("login");
            }}
          >
            {formMode == "login" ? "Sign up." : "Log in."}
          </a>
        </p>
      </form>
    </main>
  );
}
