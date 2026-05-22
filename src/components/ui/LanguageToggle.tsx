// src/components/ui/LanguageToggle.tsx
// Dropdown to switch locale. Add next to the profile avatar in TopBar.tsx:
//   import { LanguageToggle } from '../ui/LanguageToggle'
//   // inside TopBar JSX:
//   <LanguageToggle />

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LOCALES, setLocale, type SupportedLocale } from "../../i18n";

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLocale = SUPPORTED_LOCALES.find((l) => l.code === i18n.language) ?? SUPPORTED_LOCALES[0];

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(code: SupportedLocale) {
    setLocale(code);
    setOpen(false);
  }

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "5px 10px",
          borderRadius: 20,
          border: "1px solid var(--color-border-secondary)",
          background: "transparent",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 500,
          color: "var(--color-text-primary)",
        }}
      >
        {/* Globe icon (Unicode fallback — replace with your icon system) */}
        <span aria-hidden="true" style={{ fontSize: 14 }}>🌐</span>
        <span>{currentLocale.code.toUpperCase()}</span>
        <span style={{ fontSize: 10, opacity: 0.6 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Language options"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            minWidth: 160,
            background: "var(--color-background-primary)",
            border: "1px solid var(--color-border-secondary)",
            borderRadius: 10,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            overflow: "hidden",
            zIndex: 1000,
          }}
        >
          {SUPPORTED_LOCALES.map((locale) => {
            const isSelected = locale.code === i18n.language;
            return (
              <button
                key={locale.code}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(locale.code)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "10px 14px",
                  background: isSelected
                    ? "var(--color-background-secondary)"
                    : "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: isSelected ? 600 : 400,
                  color: "var(--color-text-primary)",
                  textAlign: "left",
                  direction: locale.dir === "rtl" ? "rtl" : "ltr",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--color-background-secondary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }
                }}
              >
                <span>{locale.label}</span>
                <span style={{ fontSize: 11, opacity: 0.5, fontWeight: 400 }}>
                  {locale.code.toUpperCase()}
                </span>
                {isSelected && (
                  <span style={{ fontSize: 12, color: "var(--color-text-success, #10B981)" }}>
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}