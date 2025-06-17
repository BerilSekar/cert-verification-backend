import React, { useState } from "react";
import "./App.css";
import Login from "./components/Login";
import VisitorPage from "./components/VisitorPage";
import VerifierPage from "./components/VerifierPage";
import RegistrarPage from "./components/RegistrarPage";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import HomePage from "./components/HomePage";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./components/LanguageSwitcher";
import ThemeToggle from "./components/ThemeToggle";
import { useEffect } from "react";
import VerifierHistoryModal from "./components/VerifierHistoryModal";
import InstitutionRequest from "./components/InstitutionRequest";
import AdminPanel from "./components/AdminPanel";

function App() {
  const [user, setUser] = useState(null);
  const [certId, setCertId] = useState("");
  const [response, setResponse] = useState(null);
  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [view, setView] = useState("login");
  const [resetMessage, setResetMessage] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [showInstitutionRequest, setShowInstitutionRequest] = useState(false);

  useEffect(() => {
    document.body.style.backgroundImage = darkMode
      ? 'url("/bg-dark.png")'
      : 'url("/bg-light.png")';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
  }, [darkMode]);

  const handleLogin = (userInfo) => {
    setUser(userInfo);
    setResetMessage("");
  };

  const handleLogout = () => {
    setUser(null);
    setResetMessage("");
    setResponse(null);
    setCertId("");
    setQuestion("");
    setAiAnswer("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://127.0.0.1:5000/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        certificate_id: certId,
        username: user?.username
      }),
    });
    const data = await res.json();
    setResponse(data);
    setAiAnswer("");
  };

  const handleAskQuestion = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificate_id: certId,
          question: question,
          lang: i18n.language,
          username: user?.username,
        }),
      });
      const data = await res.json();
      setAiAnswer(data.answer);
    } catch (error) {
      setAiAnswer("Error getting response.");
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "tr" : "en";
    i18n.changeLanguage(newLang);
  };


  return (
    <>
      <div className="top-controls">
        <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        <LanguageSwitcher />
      </div>

      <div className={`container ${darkMode ? "dark" : "light"}`}>
        {!user ? (
          !showLogin ? (
            <HomePage onStartLogin={() => setShowLogin(true)} />
          ) : forgotMode ? (
            <ForgotPassword
              onBackToLogin={() => setForgotMode(false)}
              onResetSuccess={(msg) => {
                setResetMessage(msg);
                setForgotMode(false);
              }}
            />
          ) : showInstitutionRequest ? (
            <InstitutionRequest
              onBackToLogin={() => setShowInstitutionRequest(false)}
            />
          ) : showRegister ? (
            <Register
              onRegisterSuccess={(msg) => {
                setRegistrationMessage(msg);
                setShowRegister(false);
              }}
              onCancel={() => setShowRegister(false)}
              onRequestInstitution={() => setShowInstitutionRequest(true)}
            />
          ) : (
            <Login
              onLogin={handleLogin}
              onContinueAsVisitor={() =>
                setUser({ role: "visitor", username: "guest" })
              }
              onGoToRegister={() => setShowRegister(true)}
              onForgotPassword={() => setForgotMode(true)}
              resetMessage={registrationMessage}
            />
          )
        ) : (
          <>
            <div style={{ marginBottom: "1rem" }}>
              <span style={{ marginRight: "1rem" }}>
                {t("logged_in_as")}{" "}
                <strong>
                  {user.username === "guest" ? t("guest") : user.username}
                </strong>
              </span>
              <button onClick={handleLogout}>{t("logout")}</button>
            </div>

            {user.role === "visitor" && <VisitorPage />}

            {user.role === "verifier" && (
              <VerifierPage
                certId={certId}
                setCertId={setCertId}
                response={response}
                handleSubmit={handleSubmit}
                question={question}
                setQuestion={setQuestion}
                aiAnswer={aiAnswer}
                handleAskQuestion={handleAskQuestion}
              />
            )}

            {user.role === "registrar" && <RegistrarPage />}

            {user.role === "admin" && <AdminPanel />}
          </>
        )}
      </div>

      {user && user.role === "verifier" && (
        <>
          <button
            onClick={() => setShowHistory(prev => !prev)}
            style={{
              position: "fixed",
              bottom: "1rem",
              left: "1rem",
              zIndex: 999,
              padding: "0.5rem 1rem",
              backgroundColor: "#444",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            {t("view_history")}
          </button>

          {showHistory && (
            <VerifierHistoryModal
              username={user.username}
              onClose={() => setShowHistory(false)}
            />
          )}
        </>
      )}
    </>
  );
}

export default App;