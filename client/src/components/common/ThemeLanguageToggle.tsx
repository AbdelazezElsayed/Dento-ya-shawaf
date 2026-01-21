import { useState } from "react";
import { Moon, Sun, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle("dark");
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
        >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
    );
}

interface LanguageToggleProps {
    language: "ar" | "en";
    onLanguageChange: (lang: "ar" | "en") => void;
}

export function LanguageToggle({ language, onLanguageChange }: LanguageToggleProps) {
    const toggleLanguage = () => {
        const newLang: "ar" | "en" = language === "ar" ? "en" : "ar";
        onLanguageChange(newLang);
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            data-testid="button-language-toggle"
            title={language === "ar" ? "English" : "العربية"}
        >
            <Globe className="h-5 w-5" />
            <span className="text-xs ml-1">{language === "ar" ? "EN" : "AR"}</span>
        </Button>
    );
}

export default { ThemeToggle, LanguageToggle };
