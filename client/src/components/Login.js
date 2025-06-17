import React, { useState } from "react";
import { useTranslation } from "react-i18next";

function Login({ onLogin, onContinueAsVisitor, onGoToRegister, onForgotPassword, resetMessage }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("username", username);
        localStorage.setItem("role", data.role);
        onLogin({ username, role: data.role });
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
      <h2>{t("login")}</h2>
      {resetMessage && (
        <p style={{ color: "green", marginBottom: "1rem" }}>
          {resetMessage}
        </p>
      )}
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder={t("username")}
          value={username}
          required
          onChange={(e) => setUsername(e.target.value)}
        />

        <div style={{ position: "relative", marginBottom: "1rem" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder={t("password")}
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem 2.5rem 0.5rem 0.5rem",
              boxSizing: "border-box"
            }}
          />
          <i
            className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}
            onClick={() => setShowPassword((prev) => !prev)}
            style={{
              position: "absolute",
              top: "1.2rem",
              right: "0.8rem",
              transform: "translateY(-50%)",
              cursor: "pointer",
              fontSize: "1.2rem",
              color: "#666"
            }}
          ></i>
        </div>


        <button type="submit" style={{
          width: "100%", padding: "0.5rem", boxSizing: "border-box"
        }}>
          {t("login")}
        </button>
      </form>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "0.5rem",
        }}
      >
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onGoToRegister();
          }}
          style={{
            color: "blue",
            textDecoration: "underline",
            fontSize: "0.95rem",
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          {t("dont_have_account")}
        </a>

        <button
          onClick={onContinueAsVisitor}
          style={{
            background: "none",
            border: "none",
            color: "blue",
            textDecoration: "underline",
            fontSize: "0.95rem",
            cursor: "pointer",
            fontFamily: "inherit",
            padding: 0,
          }}
        >
          {t("continue_without_login")}
        </button>
      </div>

      <p style={{ textAlign: "center", marginTop: "0.5rem" }}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onForgotPassword();
          }}
          style={{
            color: "blue",
            textDecoration: "underline",
            fontSize: "0.9rem",
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          {t("forgot_password")}
        </a>
      </p>


      {error && (
        <p style={{ color: "red", marginTop: "1rem" }}>
          <strong>{error}</strong>
        </p>
      )}
    </div>
  );
}

export default Login;