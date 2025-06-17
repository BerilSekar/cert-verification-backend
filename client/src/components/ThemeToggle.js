import React from "react";
import { useTranslation } from "react-i18next";

function ThemeToggle({ darkMode, setDarkMode }) {
  const { t } = useTranslation();

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      style={{
        fontSize: "0.9rem",
        background: darkMode ? "#444" : "#ddd",
        color: darkMode ? "white" : "black",
        border: "1px solid #ccc",
        borderRadius: "6px",
        padding: "0.5rem 1rem",
        cursor: "pointer",
        marginLeft: "0.5rem"
      }}
    >
      {darkMode ? '🌙 ' + t("dark_mode") : '☀️ ' + t("light_mode")}
    </button>
  );
}

export default ThemeToggle;