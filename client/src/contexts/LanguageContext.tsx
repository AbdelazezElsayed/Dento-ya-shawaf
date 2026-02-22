import React, { createContext, useContext, useState, useEffect } from "react";

interface LanguageContextType {
  language: "ar" | "en";
  setLanguage: (lang: "ar" | "en") => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<"ar" | "en">("ar");

  useEffect(() => {
    const saved = localStorage.getItem("language") as "ar" | "en" | null;
    if (saved) {
      setLanguage(saved);
    }
  }, []);

  const handleLanguageChange = (lang: "ar" | "en") => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleLanguageChange }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
