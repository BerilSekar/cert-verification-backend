import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

function Register({ onRegisterSuccess, onCancel, onRequestInstitution }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secretWord, setSecretWord] = useState("");
  const [role, setRole] = useState("verifier");
  const [message, setMessage] = useState("");
  const { t } = useTranslation();
  const [selectedInstitution, setSelectedInstitution] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [institutions, setInstitutions] = useState([]);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          role,
          secret_word: secretWord,
          email,
          institution_domain: selectedInstitution,
          role_code: code,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        onRegisterSuccess(t("registration_success"));
      } else {
        if (data.error === "Invalid registrar code") {
          setMessage(t("error_invalid_code"));
        } else if (data.error === "Email domain does not match selected institution") {
          setMessage(t("error_email_domain_mismatch"));
        } else {
          setMessage(data.error || t("registration_failed"));
        }
      }
    } catch (error) {
      setMessage(t("server_error"));
    }
  };
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/institutions");
        const data = await res.json();
        setInstitutions(data);
      } catch {
        setInstitutions([]);
      }
    };
    fetchInstitutions();
  }, []);

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
      <h2>{t("register")}</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (
            role === "registrar" &&
            selectedInstitution &&
            !email.includes(selectedInstitution)
          ) {
            setMessage(t("error_email_domain_mismatch"));
            return;
          }
          handleRegister(e);
        }}
      >
        <input
          type="text"
          placeholder={t("username")}
          value={username}
          required
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder={t("password")}
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <div style={{ position: "relative", marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder={t("secret_word")}
            value={secretWord}
            required
            onChange={(e) => setSecretWord(e.target.value)}
          />
          <div
            style={{
              position: "absolute",
              top: "1.4rem",
              right: "0.8rem",
              transform: "translateY(-50%)",
              cursor: "help",
              fontSize: "1.1rem",
              color: "gray",
              lineHeight: "1",
              pointerEvents: "auto",
            }}
            title={t("secret_word_tooltip")}
          >
            🛈
          </div>
        </div>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ marginBottom: "1rem", width: "100%", padding: "0.5rem" }}
        >
          <option value="verifier">{t("verifier")}</option>
          <option value="registrar">{t("registrar")}</option>
        </select>

        {role === "registrar" && (
          <>
            <select
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
              style={{
                marginBottom: "1rem",
                width: "100%",
                padding: "0.5rem",
              }}
            >
              <option value="">{t("select_institution")}</option>
              {[...institutions]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((inst, idx) => (
                  <option key={idx} value={inst.domain}>
                    {inst.name}
                  </option>
                ))}
            </select>

            {role === "registrar" && (
              <p style={{ textAlign: "center", fontSize: "0.9rem", marginTop: "-0.5rem", marginBottom: "1rem" }}>
                {t("cant_find_institution")}{" "}
                <span
                  onClick={onRequestInstitution}
                  style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }}
                >
                  {t("click_to_request")}
                </span>
              </p>
            )}

            <input
              type="email"
              placeholder={t("institutional_email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder={t("institution_code")}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </>
        )}

        <button type="submit" style={{ width: "100%", padding: "0.5rem" }}>
          {t("register")}
        </button>
      </form>

      {message && <p style={{ color: "red", marginTop: "1rem" }}>{message}</p>}

      <p style={{ textAlign: "center", marginTop: "1rem" }}>
        <a href="#" onClick={onCancel} style={{ color: "blue" }}>
          {t("back_to_login")}
        </a>
      </p>
    </div>
  );
}

export default Register;