import React from "react";
import { useTranslation } from "react-i18next";

function HomePage({ onStartLogin }) {
  const { t } = useTranslation();

  return (
    <div style={{ textAlign: "center", padding: "3rem" }}>

      <h1 style={{ fontSize: "2rem", marginBottom: "2rem" }}>
        {t("app_title")}
      </h1>

      <p style={{ maxWidth: "500px", margin: "auto", marginBottom: "2rem" }}>
        {t("app_description")}
      </p>

      <button
        onClick={onStartLogin}
        style={{
          padding: "0.8rem 2rem",
          fontSize: "1rem",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        {t("login")}
      </button>
    </div>
  );
}

export default HomePage;