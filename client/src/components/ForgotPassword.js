import React, { useState } from "react";
import { useTranslation } from "react-i18next";

function ForgotPassword({ onBackToLogin, onResetSuccess }) {
  const [username, setUsername] = useState("");
  const [secret, setSecret] = useState("");
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
        body: JSON.stringify({ username, secret, new_password: newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ " + data.message);
        onResetSuccess("Password reset successful. Please log in with your new password.");
        setTimeout(() => {
          onBackToLogin(); 
        }, 2000);
      } else {
        setMessage("❌ " + (data.error || "Reset failed."));
      }
    } catch {
      setMessage("❌ Server error.");
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
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder={t("secret_word")}
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={t("new_password")}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button type="submit" style={{ width: "100%", padding: "0.5rem" }}>
          {t("reset_password")}
        </button>
      </form>
      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
      <p style={{ textAlign: "center", marginTop: "1rem" }}>
        <a href="#" onClick={onBackToLogin} style={{ color: "blue" }}>
          {t("back_to_login")}
        </a>
      </p>
    </div>
  );
}

export default ForgotPassword;
