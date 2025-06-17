import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";


function AdminPanel() {
  const [pendingInstitutions, setPendingInstitutions] = useState([]);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchPendingInstitutions();
  }, []);

  const fetchPendingInstitutions = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/pending-institutions");
      const data = await res.json();
      setPendingInstitutions(data);
    } catch (err) {
      setMessage("Failed to fetch pending institutions.");
    }
  };

  const approveInstitution = async (domain) => {
    try {
      const res = await fetch("http://127.0.0.1:5000/approve-institution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(t("institution_approved", { domain: domain, code: data.code }));
        setPendingInstitutions(pendingInstitutions.filter((inst) => inst.domain !== domain));
      } else {
        setMessage(t("institution_approval_failed", { error: data.error }));
      }
    } catch {
      setMessage(t("institution_server_error"));
    }
  };

  const rejectInstitution = async (domain) => {
    try {
      const res = await fetch("http://127.0.0.1:5000/reject-institution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`${domain} ${t("rejected")}`);
        setPendingInstitutions(pendingInstitutions.filter((inst) => inst.domain !== domain));
      } else {
        setMessage(data.error || t("reject_failed"));
      }
    } catch {
      setMessage(t("server_error"));
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h2>{t("admin_panel_title")}</h2>

      {message && <p style={{ color: isSuccess ? "green" : "red" }}>{message}</p>}

      {pendingInstitutions.length === 0 ? (
        <p>{t("no_pending_requests")}</p>
      ) : (
        pendingInstitutions.map((inst, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1rem",
              backgroundColor: "#f9f9f9",
            }}
          >
            <p><strong>{t("name")}:</strong> {inst.name}</p>
            <p><strong>{t("domain")}:</strong> {inst.domain}</p>
            <p><strong>{t("email")}:</strong> {inst.email}</p>
            {inst.message && <p><strong>{t("message")}:</strong> {inst.message}</p>}
            <button
              style={{
                marginTop: "0.5rem",
                backgroundColor: "#2e7d32",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer"
              }}
              onClick={() => approveInstitution(inst.domain)}>{t("approve")}</button>
            <button
              style={{
                marginLeft: "1rem",
                backgroundColor: "#c62828",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer"
              }}
              onClick={() => rejectInstitution(inst.domain)}
            >
              {t("reject")}
            </button>

          </div>
        ))
      )}
    </div>
  );
}

export default AdminPanel;