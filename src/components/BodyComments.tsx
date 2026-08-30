import { useEffect, useRef } from "react";
import CardComment from "./CardComment";
import { CommentStore } from "../store/preferences";

export default function BodyComments() {
  const { comments } = CommentStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Retardo mínimo para que el render complete y el scroll baje exactamente al final
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    return () => clearTimeout(timer);
  }, [comments]);

  return (
    <div className="flex flex-col gap-2.5 p-3 sm:p-4 h-full overflow-y-auto overscroll-contain">
      {/* iOS Date / Info Pill */}
      <div className="flex justify-center my-1">
        <span className="bg-slate-100/90 dark:bg-palette-eden-card/90 text-slate-500 dark:text-palette-sinbad text-[11px] font-medium px-3 py-1 rounded-full border border-slate-200/60 dark:border-palette-eden/60 shadow-2xs transition-colors">
          Hoy • Supabase Realtime
        </span>
      </div>

      {comments.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-sm gap-2 h-full my-auto py-12">
          <div className="w-14 h-14 rounded-full bg-palette-bondi-light dark:bg-palette-bondi/20 text-palette-bondi dark:text-palette-sinbad flex items-center justify-center text-2xl shadow-2xs">
            💬
          </div>
          <p className="font-semibold text-slate-700 dark:text-palette-janna text-sm mt-1">Sin mensajes aún</p>
          <span className="text-xs text-slate-400 dark:text-slate-500">Escribe el primer mensaje para comenzar</span>
        </div>
      ) : (
        comments.map((el) => <CardComment key={el.id} data={el} />)
      )}
      <div ref={bottomRef} className="h-1 shrink-0" />
    </div>
  );
}





