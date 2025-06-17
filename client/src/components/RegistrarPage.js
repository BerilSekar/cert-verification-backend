import React, { useState } from "react";
import { useTranslation } from "react-i18next";

function RegistrarPage() {
  const [certId, setCertId] = useState("");
  const [submitResult, setSubmitResult] = useState(null);
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://127.0.0.1:5000/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ certificate_id: certId }),
      });

      const data = await res.json();
      setSubmitResult(data);
    } catch (error) {
      setSubmitResult({ error: "Network error or server not responding." });
    }
  };

  const getMessageClass = () => {
    if (submitResult.error) return "error-message";
    if (submitResult.message === t("certificate_already_submitted")) return "warning-message";
    if (submitResult.message === t("certificate_submitted_successfully")) return "success-message";
    return "";
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{t("submit_new_certificate")}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={t("enter_certificate_id")}
          value={certId}
          onChange={(e) => setCertId(e.target.value)}
          required
        />
        <button type="submit" style={{ marginLeft: "1rem" }}>
          {t("submit")}
        </button>
      </form>

      {submitResult && (
        <div className={`feedback-box ${getMessageClass()}`}>
          {submitResult.message && (
            <p>{submitResult.message}</p>
          )}
          {submitResult.error && (
            <p>{submitResult.error}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default RegistrarPage;