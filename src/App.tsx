import { useEffect } from "react";
import CommentInput from "./components/CommentInput";
import UserInput from "./components/UserInput";
import { CommentStore } from "./store/preferences";

export default function App() {
  const { user, theme } = CommentStore();
  const isAuthenticated = Boolean(user?.name && user?.profileImg);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const isDark =
        theme === "dark" || (theme === "system" && mediaQuery.matches);
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    applyTheme();

    // Escucha cambios en tiempo real del sistema operativo
    mediaQuery.addEventListener("change", applyTheme);
    return () => mediaQuery.removeEventListener("change", applyTheme);
  }, [theme]);

  return (
    <div className="h-[100dvh] w-full bg-slate-100 dark:bg-palette-eden-darker sm:bg-gradient-to-b sm:from-slate-100 sm:to-slate-200 dark:sm:from-palette-eden-darker dark:sm:to-[#041217] flex flex-col justify-center items-center p-0 sm:p-4 text-slate-800 dark:text-palette-janna overflow-hidden transition-colors duration-300">
      <main className="w-full max-w-md md:max-w-lg h-full sm:h-[92vh] bg-white dark:bg-palette-eden-dark flex flex-col overflow-hidden sm:rounded-[32px] sm:border sm:border-slate-200/80 dark:sm:border-slate-700/60 sm:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] dark:sm:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] transition-colors duration-300">
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto bg-gradient-to-b from-palette-bondi-subtle to-white dark:from-palette-eden-darker dark:to-palette-eden-dark">
            <UserInput />
          </div>
        ) : (
          <CommentInput />
        )}
      </main>
    </div>
  );
}





