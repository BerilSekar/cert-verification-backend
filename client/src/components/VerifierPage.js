import React from "react";
import { useTranslation } from "react-i18next";

function VerifierPage({
  certId,
  setCertId,
  response,
  handleSubmit,
  question,
  setQuestion,
  aiAnswer,
  handleAskQuestion
}) {
  const { t } = useTranslation();

  return (
    <>
      <h2>{t("verifier_title")}</h2>
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

      {response && response.status === "Certificate Verified" && (
        <div style={{ marginTop: "2rem" }}>
          <input
            type="text"
            placeholder={t("ask_question_placeholder")}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button onClick={handleAskQuestion}>{t("ask_ai")}</button>
          {aiAnswer && (
            <p style={{ marginTop: "1rem" }}>
              <strong>{t("ai_answer")}:</strong> {aiAnswer}
            </p>
          )}
        </div>
      )}
    </>
  );
}

export default VerifierPage;