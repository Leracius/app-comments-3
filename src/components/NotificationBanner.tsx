import { useEffect } from "react";
import { CommentStore } from "../store/preferences";
import { IoCloseOutline, IoChatbubbleEllipsesOutline } from "react-icons/io5";

export default function NotificationBanner() {
  const { inAppBanner, clearInAppBanner, setCurrentRoom } = CommentStore();

  useEffect(() => {
    if (inAppBanner) {
      const timer = setTimeout(() => {
        clearInAppBanner();
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [inAppBanner, clearInAppBanner]);

  if (!inAppBanner) return null;

  return (
    <div className="absolute top-16 left-3 right-3 sm:left-6 sm:right-6 z-50 flex justify-center pointer-events-none animate-in slide-in-from-top-4 duration-200">
      <div className="bg-white/95 dark:bg-palette-eden-card/95 backdrop-blur-xl border border-palette-bondi/30 dark:border-palette-sinbad/30 shadow-xl rounded-2xl p-3 flex items-center justify-between gap-3 max-w-md w-full pointer-events-auto transition-all">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <img
            src={inAppBanner.avatar}
            alt={inAppBanner.title}
            className="w-9 h-9 rounded-full object-cover border border-palette-bondi/30 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-palette-bondi dark:text-palette-sinbad flex items-center gap-1">
                <IoChatbubbleEllipsesOutline /> Nuevo Mensaje
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-palette-janna truncate">
              {inAppBanner.title}
            </p>
            <p className="text-[11.5px] text-slate-600 dark:text-slate-300 truncate">
              {inAppBanner.message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => {
              setCurrentRoom(inAppBanner.roomId);
              clearInAppBanner();
            }}
            className="px-2.5 py-1 bg-palette-bondi hover:bg-palette-bondi-hover text-white text-[11px] font-bold rounded-xl transition active:scale-95 shadow-xs cursor-pointer"
          >
            Ver
          </button>
          <button
            onClick={clearInAppBanner}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-palette-eden transition cursor-pointer"
          >
            <IoCloseOutline size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
