import { useState } from "react";
import { useNavigate } from "react-router";
import { login, register, logout } from "../services/authService";

export default function Auth() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setMessage("");

    try {
      if (mode === "register") {
        const result = await register(email, password);

        if (result.session) {
          navigate("/practice");
        } else {
          setMessage("Registration received. Check your email to confirm your account.");
        }
      } else {
        await login(email, password);
        navigate("/practice");
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Authentication failed."
      );
    } finally {
      setBusy(false);
    }
  }

  async function continueAsGuest() {
  try {
    await logout();
    navigate("/practice");
  } catch {
    setMessage("Unable to sign out. Please try again.");
  }
}

  return (
    <main>
      <h1>{mode === "login" ? "Log In" : "Create Account"}</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            autoComplete={
              mode === "register" ? "new-password" : "current-password"
            }
            minLength={6}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <button disabled={busy} type="submit">
          {busy ? "Please wait..." : mode === "login" ? "Log In" : "Register"}
        </button>
      </form>

      <p role="status">{message}</p>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setMessage("");
        }}
      >
        {mode === "login"
          ? "Need an account? Register"
          : "Already registered? Log in"}
      </button>

      <p>
        <button type="button" onClick={continueAsGuest}>
          Continue as guest
        </button>
      </p>
    </main>
  );
}