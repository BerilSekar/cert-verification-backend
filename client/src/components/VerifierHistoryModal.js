import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

function VerifierHistoryModal({ username, onClose }) {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const modalRef = useRef();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/verifier-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });
        const data = await res.json();
        setLogs(data.reverse());
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [username]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={modalRef}
      style={{
        position: "fixed",
        bottom: "4rem",
        left: "1rem",
        backgroundColor: "#ffffff",
        padding: "1.5rem",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        maxWidth: "400px",
        maxHeight: "80vh",
        overflowY: "auto",
        zIndex: 1000,
      }}
    >
      <h3>{t("history_title")}</h3>
      {loading ? (
        <p>{t("loading") || "Loading..."}</p>
      ) : logs.length === 0 ? (
        <p>{t("no_history")}</p>
      ) : (
        <ul style={{ paddingLeft: "1rem" }}>
          {logs.map((entry, idx) => (
            <li key={idx} style={{ marginBottom: "1rem" }}>
              <strong>{t("cert_id")}:</strong> {entry.certificate_id}
              {entry.question && (
                <>
                  <br />
                  <strong>{t("question")}:</strong> {entry.question}
                  <br />
                  <strong>{t("answer")}:</strong> {entry.answer}
                </>
              )}
              <br />
              <strong>{t("timestamp")}:</strong> {new Date(entry.timestamp).toLocaleString()}
              <hr />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default VerifierHistoryModal;