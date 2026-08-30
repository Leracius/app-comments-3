import { useState } from "react";
import { CommentRes } from "../types";
import { CommentStore } from "../store/preferences";
import { VscTrash } from "react-icons/vsc";
import { deleteSingleComment } from "../services/supabase";

type BodyCommentProps = {
  data: CommentRes;
};

export default function CardComment({ data }: BodyCommentProps) {
  const { user, removeComment } = CommentStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const isMe = data.name === user.name;
  const isAdmin = user.name?.trim().toLowerCase() === "axeladmin";
  const isSystem = data.name === "SISTEMA" || data.content?.startsWith("📢 [ANUNCIO OFICIAL]");

  const handleDeleteThis = async () => {
    if (!isAdmin || isDeleting) return;
    const confirm = window.confirm(`¿Eliminar este mensaje de @${data.name}?`);
    if (!confirm) return;

    try {
      setIsDeleting(true);
      await deleteSingleComment(data.id);
      removeComment(data.id);
    } catch (err: any) {
      alert("Error al eliminar mensaje: " + (err?.message || err));
    } finally {
      setIsDeleting(false);
    }
  };

  // Mensaje especial de SISTEMA / ANUNCIO estilo iOS Banner
  if (isSystem) {
    return (
      <div className="my-3 px-4 py-3 bg-palette-janna-light dark:bg-palette-eden-card border border-palette-janna-border/80 dark:border-palette-sinbad/30 rounded-2xl shadow-xs text-center space-y-1 animate-in fade-in duration-300 mx-auto max-w-[92%] transition-colors">
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-palette-eden dark:text-palette-sinbad tracking-wider uppercase">
          <span>📢</span> COMUNICADO OFICIAL
        </div>
        <p className="text-[13px] font-medium text-slate-800 dark:text-palette-janna whitespace-pre-wrap break-words [overflow-wrap:anywhere] leading-snug">
          {data.content.replace("📢 [ANUNCIO OFICIAL]: ", "")}
        </p>
        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 dark:text-slate-400 pt-0.5">
          <span>{new Date(data.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          {isAdmin && (
            <button
              onClick={handleDeleteThis}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium underline ml-1 cursor-pointer"
            >
              Borrar
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex gap-2 items-end transition-opacity duration-200 ${
        isDeleting ? "opacity-30" : "opacity-100"
      } ${isMe ? "flex-row-reverse" : "flex-row"}`}
    >
      <img
        className="h-7 w-7 sm:h-8 sm:w-8 object-cover rounded-full border border-slate-200 dark:border-slate-700 shrink-0 mb-0.5 shadow-2xs"
        src={data.profileImg || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.name)}`}
        alt={data.name}
      />
      <div
        className={`px-3.5 py-2 sm:px-4 sm:py-2.5 space-y-1 max-w-[84%] sm:max-w-[78%] relative transition-colors duration-200 ${
          isMe
            ? "bg-gradient-to-b from-palette-bondi to-[#05849e] dark:from-palette-bondi dark:to-palette-sanmarino text-white rounded-[20px] rounded-br-[4px] shadow-[0_3px_12px_rgba(7,153,182,0.22)]"
            : "bg-palette-sinbad-bubble dark:bg-palette-eden-card text-slate-800 dark:text-palette-janna border border-palette-sinbad/50 dark:border-palette-eden/80 rounded-[20px] rounded-bl-[4px] shadow-2xs"
        }`}
      >
        {!isMe && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11.5px] font-semibold text-palette-eden-light dark:text-palette-sinbad tracking-tight">
              @{data.name}
            </span>
          </div>
        )}

        {data.bodyImg && data.bodyImg.trim() !== "" && (
          <div className="my-1 overflow-hidden rounded-xl bg-black/5 dark:bg-black/20">
            <img
              className="max-h-56 sm:max-h-64 w-full object-cover rounded-lg hover:opacity-95 transition duration-150 cursor-pointer"
              src={data.bodyImg}
              alt="adjunto"
              loading="lazy"
              onClick={() => window.open(data.bodyImg, "_blank")}
            />
          </div>
        )}

        <div className="flex items-end justify-between gap-3 flex-wrap">
          {data.content && (
            <p
              className={`text-[14px] sm:text-[14.5px] leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] flex-1 ${
                isMe ? "text-white font-normal" : "text-slate-800 dark:text-palette-janna font-normal"
              }`}
            >
              {data.content}
            </p>
          )}

          <div className="flex items-center gap-1 shrink-0 ml-auto pt-0.5">
            {data.createdAt && (
              <span
                className={`text-[10px] font-medium ${
                  isMe ? "text-white/75" : "text-slate-400 dark:text-slate-400"
                }`}
              >
                {new Date(data.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}

            {isAdmin && (
              <button
                onClick={handleDeleteThis}
                disabled={isDeleting}
                title="Eliminar este mensaje (Admin)"
                className={`p-0.5 transition rounded active:scale-90 ${
                  isMe ? "text-white/70 hover:text-white" : "text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                }`}
              >
                <VscTrash size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}





