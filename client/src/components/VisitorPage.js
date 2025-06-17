import React, { useState } from "react";
import { useTranslation } from "react-i18next";

function VisitorPage() {
  const [certId, setCertId] = useState("");
  const [response, setResponse] = useState(null);
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://127.0.0.1:5000/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ certificate_id: certId }),
      });

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({ status: t("server_error") });
    }
  };

  return (
    <div>
      <h2>{t("certificate_verification")}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={t("enter_certificate_id")}
          value={certId}
          onChange={(e) => setCertId(e.target.value)}
          required
        />
        <button type="submit">{t("verify")}</button>
      </form>

      {response && (
        <div
          className={`result-box ${response.status === "Certificate Verified" ? "success" : "error"
            }`}
          style={{ marginTop: "1rem" }}
        >
          <p>
            <strong>{t("status")}:</strong> {response.status}
          </p>
          {response.ai_explanation && (
            <p>
              <strong>{t("ai_explanation")}:</strong> {response.ai_explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default VisitorPage;