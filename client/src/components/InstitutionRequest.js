import React, { useState } from "react";
import { useTranslation } from "react-i18next";

function InstitutionRequest({ onBackToLogin }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [isError, setIsError] = useState(false); // ✅

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedbackMsg("");
    setIsError(false); // Başlangıçta sıfırla

    try {
      const res = await fetch("http://127.0.0.1:5000/institution-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, domain, email, message }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedbackMsg(t("request_sent_success"));
        setIsError(false);
        setName("");
        setDomain("");
        setEmail("");
        setMessage("");
      } else {
        setFeedbackMsg(data.error || t("request_failed"));
        setIsError(true);
      }
    } catch {
      setFeedbackMsg(t("server_error"));
      setIsError(true);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
      <h2>{t("institution_request_title")}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={t("institution_name")}
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder={t("institution_domain")}
          value={domain}
          required
          onChange={(e) => setDomain(e.target.value)}
        />
        <input
          type="email"
          placeholder={t("institution_email")}
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <textarea
          placeholder={t("optional_message")}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          style={{
            marginBottom: "1rem",
            width: "100%",
            padding: "0.5rem",
            resize: "vertical",
          }}
        />
        <button type="submit" style={{ width: "100%", padding: "0.5rem" }}>
          {t("submit_request")}
        </button>
      </form>

      {feedbackMsg && (
        <p style={{ marginTop: "1rem", color: isError ? "red" : "green" }}>
          {feedbackMsg}
        </p>
      )}

      <p style={{ textAlign: "center", marginTop: "1rem" }}>
        <a href="#" onClick={onBackToLogin} style={{ color: "blue" }}>
          {t("back_to_login")}
        </a>
      </p>
    </div>
  );
}

export default InstitutionRequest;