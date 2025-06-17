import React, { useState } from "react";
import { useTranslation } from "react-i18next";

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const languages = [
    { code: "en", label: "English" },
    { code: "tr", label: "Türkçe" }
  ];

  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "#666",
          color: "white",
          border: "none",
          borderRadius: "6px",
          padding: "0.5rem 1rem",
          cursor: "pointer"
        }}
      >
        🌐 {currentLanguage.label}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "2.5rem",
            right: 0,
            backgroundColor: "#eee",
            border: "1px solid #ccc",
            borderRadius: "5px",
            zIndex: 10,
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
          }}
        >
          {languages.map((lang) => (
            <div
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              style={{
                padding: "0.5rem 1rem",
                cursor: "pointer",
                backgroundColor: i18n.language === lang.code ? "#ddd" : "transparent"
              }}
            >
              {lang.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;