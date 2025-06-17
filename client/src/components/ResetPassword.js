import React, { useState } from "react";
import { useTranslation } from "react-i18next";

function ResetPassword({ onBackToLogin }) {
  const [username, setUsername] = useState("");
  const [secretWord, setSecretWord] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const { t } = useTranslation();

  const handleReset = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://127.0.0.1:5000/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          secret_word: secretWord,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(t("password_reset_success"));
      } else {
        setMessage(data.error || t("reset_failed"));
      }
    } catch {
      setMessage(t("server_error"));
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
      <h2>{t("reset_password")}</h2>
      <form onSubmit={handleReset}>
        <input
          type="text"
          placeholder={t("username")}
          value={username}
          required
          onChange={(e) => setUsername(e.target.value)}

        />
        <input
          type="text"
          placeholder={t("secret_word")}
          value={secretWord}
          required
          onChange={(e) => setSecretWord(e.target.value)}
        />
        <input
          type="password"
          placeholder={t("new_password")}
          value={newPassword}
          required
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button type="submit" style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}>
          {t("reset_password")}
        </button>
      </form>
      {message && <p style={{ color: "green", marginTop: "1rem" }}>{message}</p>}
      <p style={{ textAlign: "center", marginTop: "1rem" }}>
        <a href="#" onClick={onBackToLogin} style={{ color: "blue" }}>
          {t("back_to_login")}
        </a>
      </p>
    </div>
  );
}

export default ResetPassword;