import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getNode } from "../data/chatbotData";
import { useFocusTrap } from "../hooks/useFocusTrap";
import logoSJ from "../assets/images/logo-vert.webp";
import "./Chatbot.css";

const STORAGE_KEY = "sj-chatbot-opened-once";
// Session scope : la bulle d'invitation réapparaît à chaque nouvelle session
// tant que l'utilisateur ne l'a pas fermée / n'a pas ouvert le chat.
const NUDGE_DISMISSED_KEY = "sj-chatbot-nudge-dismissed";
const AI_MAX_INPUT_LENGTH = 500;
const AI_MAX_HISTORY = 10;

// Chemins internes autorisés pour la transformation automatique en liens cliquables.
// Whitelist stricte : aucun lien externe, aucun chemin inconnu.
const INTERNAL_PATHS = [
  "/produits",
  "/restaurants",
  "/allergenes",
  "/catering",
  "/contact",
  "/faq",
  "/adn",
  "/nos-piliers",
];
const CONTACT_EMAIL = "contact@soup-juice.com";

// Expression régulière combinant les chemins internes et l'email.
// Les chemins sont classés du plus long au plus court pour éviter les matches partiels.
const LINK_PATTERN = new RegExp(
  `(${CONTACT_EMAIL.replace(/\./g, "\\.")}|${[...INTERNAL_PATHS]
    .sort((a, b) => b.length - a.length)
    .map((p) => p.replace(/[/]/g, "\\/"))
    .join("|")})(?![\\w-])`,
  "gi",
);

function createBotMessage(node) {
  return {
    id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role: "bot",
    text: node.text,
    items: node.items || null,
  };
}

function createTextMessage(role, text) {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    text,
  };
}

/**
 * Transforme un texte en fragments React : les chemins internes connus et
 * l'email de contact deviennent des liens cliquables (navigation SPA / mailto).
 * Sûr par construction : whitelist stricte, aucun HTML injecté.
 */
function renderTextWithLinks(text, onInternalClick) {
  if (!text) return null;
  const parts = [];
  let lastIndex = 0;
  let match;
  LINK_PATTERN.lastIndex = 0;

  while ((match = LINK_PATTERN.exec(text)) !== null) {
    const [value] = match;
    const start = match.index;
    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }

    if (value.toLowerCase() === CONTACT_EMAIL) {
      parts.push(
        <a
          key={`link-${start}`}
          href={`mailto:${CONTACT_EMAIL}`}
          className="sj-chatbot-link"
        >
          {value}
        </a>,
      );
    } else {
      const normalizedPath = value.toLowerCase();
      parts.push(
        <button
          key={`link-${start}`}
          type="button"
          className="sj-chatbot-link"
          onClick={() => onInternalClick(normalizedPath)}
        >
          {value}
        </button>,
      );
    }
    lastIndex = start + value.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export const Chatbot = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  // Mode IA (chat libre)
  const [aiMode, setAiMode] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiSending, setAiSending] = useState(false);
  // Historique uniquement AI (ce qui est envoyé au serveur)
  const aiHistoryRef = useRef([]);

  const panelRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const messagesEndRef = useRef(null);
  const aiInputRef = useRef(null);

  useFocusTrap(panelRef, { active: isOpen });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const dismissed = window.sessionStorage.getItem(NUDGE_DISMISSED_KEY);
    if (dismissed) return undefined;
    const timer = window.setTimeout(() => setShowNudge(true), 2500);
    return () => window.clearTimeout(timer);
  }, []);

  const dismissNudge = useCallback(() => {
    setShowNudge(false);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(NUDGE_DISMISSED_KEY, "1");
    }
  }, []);

  const resetConversation = useCallback(() => {
    const rootNode = getNode("root", t);
    setMessages([createBotMessage(rootNode)]);
    setCurrentNode({ id: "root", params: {}, node: rootNode });
    setAiMode(false);
    aiHistoryRef.current = [];
  }, [t]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      resetConversation();
    }
  }, [isOpen, messages.length, resetConversation]);

  useEffect(() => {
    if (!currentNode) return;
    const refreshed = getNode(currentNode.id, t, currentNode.params);
    setCurrentNode((prev) => (prev ? { ...prev, node: refreshed } : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isTyping, aiMode]);

  useEffect(() => {
    if (aiMode && aiInputRef.current) {
      aiInputRef.current.focus();
    }
  }, [aiMode]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKey = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  const openChat = () => {
    setIsOpen(true);
    setShowNudge(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
      window.sessionStorage.setItem(NUDGE_DISMISSED_KEY, "1");
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    toggleBtnRef.current?.focus();
  };

  const pushBotNode = useCallback(
    (nodeId, params = {}) => {
      const node = getNode(nodeId, t, params);
      setIsTyping(true);
      window.setTimeout(() => {
        setMessages((prev) => [...prev, createBotMessage(node)]);
        setCurrentNode({ id: nodeId, params, node });
        setIsTyping(false);
      }, 350);
    },
    [t],
  );

  const enterAiMode = useCallback(() => {
    setIsTyping(true);
    aiHistoryRef.current = [];
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        createTextMessage("bot", t("chatbot.ai.intro")),
      ]);
      setAiMode(true);
      setIsTyping(false);
    }, 300);
  }, [t]);

  const exitAiMode = useCallback(() => {
    setAiMode(false);
    aiHistoryRef.current = [];
    resetConversation();
  }, [resetConversation]);

  const sendAiMessage = useCallback(
    async (text) => {
      const trimmed = String(text || "").trim();
      if (!trimmed || aiSending) return;

      const userMsg = createTextMessage("user", trimmed.slice(0, AI_MAX_INPUT_LENGTH));
      setMessages((prev) => [...prev, userMsg]);
      setAiInput("");
      setAiSending(true);
      setIsTyping(true);

      const outgoing = [
        ...aiHistoryRef.current.slice(-AI_MAX_HISTORY),
        { role: "user", text: userMsg.text },
      ];

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: outgoing,
            language: i18n.language?.startsWith("en") ? "en" : "fr",
          }),
        });

        if (!res.ok) {
          let errorKey = "chatbot.ai.errorGeneric";
          if (res.status === 429) errorKey = "chatbot.ai.errorRateLimit";
          else if (res.status === 503) errorKey = "chatbot.ai.errorUnavailable";
          else if (res.status === 504) errorKey = "chatbot.ai.errorTimeout";
          setMessages((prev) => [...prev, createTextMessage("bot", t(errorKey))]);
          return;
        }

        const data = await res.json();
        const reply = (data?.reply || "").trim();
        if (!reply) {
          setMessages((prev) => [
            ...prev,
            createTextMessage("bot", t("chatbot.ai.errorGeneric")),
          ]);
          return;
        }

        aiHistoryRef.current = [
          ...outgoing,
          { role: "bot", text: reply },
        ].slice(-AI_MAX_HISTORY * 2);

        setMessages((prev) => [...prev, createTextMessage("bot", reply)]);
      } catch (err) {
        console.error("[chatbot] AI error:", err);
        setMessages((prev) => [
          ...prev,
          createTextMessage("bot", t("chatbot.ai.errorNetwork")),
        ]);
      } finally {
        setAiSending(false);
        setIsTyping(false);
      }
    },
    [aiSending, i18n.language, t],
  );

  const handleOptionClick = useCallback(
    (option) => {
      const { action, label } = option;
      const cleanLabel = String(label).replace(/^[^\p{L}\p{N}]+/u, "").trim() || label;
      setMessages((prev) => [...prev, createTextMessage("user", cleanLabel)]);

      switch (action.type) {
        case "goto":
          pushBotNode(action.nodeId, action.params || {});
          break;
        case "ai":
          enterAiMode();
          break;
        case "link": {
          const node = {
            text: t("chatbot.common.redirecting"),
            options: [
              {
                label: `🏠 ${t("chatbot.common.backToMenu")}`,
                action: { type: "reset" },
              },
            ],
          };
          setIsTyping(true);
          window.setTimeout(() => {
            setMessages((prev) => [...prev, createBotMessage(node)]);
            setCurrentNode({ id: "redirect", params: {}, node });
            setIsTyping(false);
            navigate(action.to);
            setIsOpen(false);
          }, 300);
          break;
        }
        case "reset":
          setIsTyping(true);
          window.setTimeout(() => {
            resetConversation();
            setIsTyping(false);
          }, 250);
          break;
        default:
          break;
      }
    },
    [enterAiMode, navigate, pushBotNode, resetConversation, t],
  );

  const handleAiSubmit = (e) => {
    e.preventDefault();
    sendAiMessage(aiInput);
  };

  const handleInternalLinkClick = useCallback(
    (path) => {
      navigate(path);
      setIsOpen(false);
    },
    [navigate],
  );

  const currentOptions = useMemo(() => {
    if (!currentNode || isTyping || aiMode) return [];
    return currentNode.node.options || [];
  }, [currentNode, isTyping, aiMode]);

  return (
    <>
      {showNudge && !isOpen && (
        <div className="sj-chatbot-nudge" role="status" aria-live="polite">
          <button
            type="button"
            className="sj-chatbot-nudge-body"
            onClick={openChat}
          >
            {t("chatbot.nudge")}
          </button>
          <button
            type="button"
            className="sj-chatbot-nudge-close"
            onClick={(e) => {
              e.stopPropagation();
              dismissNudge();
            }}
            aria-label={t("chatbot.nudgeClose")}
          >
            <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
              <path
                d="M6 6l12 12M6 18L18 6"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </button>
        </div>
      )}

      <button
        ref={toggleBtnRef}
        type="button"
        className={`sj-chatbot-toggle ${isOpen ? "sj-chatbot-toggle--open" : ""}`}
        onClick={isOpen ? closeChat : openChat}
        aria-label={isOpen ? t("chatbot.aria.close") : t("chatbot.aria.open")}
        aria-expanded={isOpen}
        aria-controls="sj-chatbot-panel"
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path
              d="M6 6l12 12M6 18L18 6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
            <path
              d="M4 5.5C4 4.67 4.67 4 5.5 4h13c.83 0 1.5.67 1.5 1.5v10c0 .83-.67 1.5-1.5 1.5H9l-4 3.5V5.5z"
              fill="currentColor"
            />
          </svg>
        )}
      </button>

      {isOpen && (
        <div
          id="sj-chatbot-panel"
          ref={panelRef}
          className="sj-chatbot-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sj-chatbot-title"
        >
          <header className="sj-chatbot-header">
            <div className="sj-chatbot-header-info">
              <div className="sj-chatbot-avatar" aria-hidden="true">
                <img src={logoSJ} alt="" />
              </div>
              <div className="sj-chatbot-header-text">
                <div id="sj-chatbot-title" className="sj-chatbot-title">
                  {t("chatbot.title")}
                </div>
                <div className="sj-chatbot-subtitle">
                  <span className="sj-chatbot-dot" aria-hidden="true" />
                  {aiMode ? t("chatbot.ai.badge") : t("chatbot.subtitle")}
                </div>
              </div>
            </div>
            <div className="sj-chatbot-header-actions">
              <button
                type="button"
                className="sj-chatbot-icon-btn"
                onClick={resetConversation}
                aria-label={t("chatbot.aria.restart")}
                title={t("chatbot.aria.restart")}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path
                    d="M4 12a8 8 0 1 0 2.34-5.66M4 4v5h5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="sj-chatbot-icon-btn"
                onClick={closeChat}
                aria-label={t("chatbot.aria.close")}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path
                    d="M6 6l12 12M6 18L18 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </button>
            </div>
          </header>

          <div className="sj-chatbot-messages" aria-live="polite">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`sj-chatbot-message sj-chatbot-message--${msg.role}`}
              >
                <div className="sj-chatbot-bubble">
                  {msg.text && (
                    <p className="sj-chatbot-text">
                      {msg.role === "bot"
                        ? renderTextWithLinks(msg.text, handleInternalLinkClick)
                        : msg.text}
                    </p>
                  )}
                  {msg.items && msg.items.length > 0 && (
                    <ul className="sj-chatbot-items">
                      {msg.items.map((item, idx) => (
                        <li key={`${msg.id}-item-${idx}`} className="sj-chatbot-item">
                          {item.to ? (
                            <button
                              type="button"
                              className="sj-chatbot-item-link"
                              onClick={() => {
                                navigate(item.to);
                                setIsOpen(false);
                              }}
                            >
                              <span className="sj-chatbot-item-title">{item.title}</span>
                              {item.subtitle && (
                                <span className="sj-chatbot-item-subtitle">
                                  {item.subtitle}
                                </span>
                              )}
                            </button>
                          ) : (
                            <>
                              <span className="sj-chatbot-item-title">{item.title}</span>
                              {item.subtitle && (
                                <span className="sj-chatbot-item-subtitle">
                                  {item.subtitle}
                                </span>
                              )}
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="sj-chatbot-message sj-chatbot-message--bot">
                <div className="sj-chatbot-bubble sj-chatbot-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {aiMode ? (
            <form
              className="sj-chatbot-ai-form"
              onSubmit={handleAiSubmit}
              aria-label={t("chatbot.ai.ariaForm")}
            >
              <button
                type="button"
                className="sj-chatbot-ai-back"
                onClick={exitAiMode}
                aria-label={t("chatbot.ai.backToMenu")}
                title={t("chatbot.ai.backToMenu")}
              >
                ←
              </button>
              <input
                ref={aiInputRef}
                type="text"
                className="sj-chatbot-ai-input"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value.slice(0, AI_MAX_INPUT_LENGTH))}
                placeholder={t("chatbot.ai.inputPlaceholder")}
                disabled={aiSending}
                maxLength={AI_MAX_INPUT_LENGTH}
                aria-label={t("chatbot.ai.inputPlaceholder")}
              />
              <button
                type="submit"
                className="sj-chatbot-ai-send"
                disabled={aiSending || !aiInput.trim()}
                aria-label={t("chatbot.ai.send")}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path
                    d="M3 20l18-8L3 4l3 8-3 8z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </form>
          ) : (
            <>
              {currentOptions.length > 0 && (
                <div
                  className="sj-chatbot-options"
                  role="group"
                  aria-label={t("chatbot.aria.options")}
                >
                  {currentOptions.map((option, idx) => (
                    <button
                      key={`${currentNode?.id}-opt-${idx}`}
                      type="button"
                      className="sj-chatbot-option"
                      onClick={() => handleOptionClick(option)}
                      data-auto-focus={idx === 0 ? "true" : undefined}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                className="sj-chatbot-ai-cta"
                onClick={enterAiMode}
                disabled={isTyping}
              >
                <span className="sj-chatbot-ai-cta-icon" aria-hidden="true">💬</span>
                <span className="sj-chatbot-ai-cta-text">
                  <strong>{t("chatbot.ai.ctaTitle")}</strong>
                  <span>{t("chatbot.ai.ctaSubtitle")}</span>
                </span>
                <span className="sj-chatbot-ai-cta-arrow" aria-hidden="true">→</span>
              </button>
            </>
          )}

          <footer className="sj-chatbot-footer">
            <span>{aiMode ? t("chatbot.ai.footer") : t("chatbot.footer")}</span>
          </footer>
        </div>
      )}
    </>
  );
};
