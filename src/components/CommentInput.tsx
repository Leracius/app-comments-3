import { CommentStore, ThemeMode } from "../store/preferences";
import { VscSend, VscTrash, VscMegaphone } from "react-icons/vsc";
import { FaPlus } from "react-icons/fa6";
import {
  IoLogOutOutline,
  IoShieldCheckmark,
  IoCloseOutline,
  IoMoonOutline,
  IoSunnyOutline,
  IoPhonePortraitOutline,
} from "react-icons/io5";

import { useEffect, useState, KeyboardEvent } from "react";
import BodyComments from "./BodyComments";
import {
  getComments,
  uploadComment,
  uploadImageToStorage,
  clearAllComments,
  sendSystemAnnouncement,
  supabase,
} from "../services/supabase";
import { CommentRes } from "../types";

export default function CommentInput() {
  const { user, comments, theme, setTheme, setComments, addComment, resetUser } = CommentStore();
  const [bodyComment, setBodyComment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Estados exclusivos de Administración para axeladmin
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false);
  const [isDeletingDb, setIsDeletingDb] = useState(false);

  const isAdmin = user.name?.trim().toLowerCase() === "axeladmin";

  useEffect(() => {
    // 1. Cargar comentarios iniciales
    const loadInitialComments = async () => {
      const data = await getComments();
      setComments(data);
    };
    loadInitialComments();

    // 2. Suscribirse a inserciones y borrados en tiempo real
    const channel = supabase
      .channel("realtime-comments")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments" },
        (payload) => {
          if (payload.new) {
            addComment(payload.new as CommentRes);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "comments" },
        () => {
          setComments([]);
        }
      )
      .subscribe((status) => {
        console.log("Estado Realtime:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setComments, addComment]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendComment();
    }
  };

  const sendComment = async () => {
    if ((!bodyComment.trim() && !file) || isSending) return;

    try {
      setIsSending(true);
      let uploadedImg = "";

      if (file) {
        uploadedImg = await uploadImageToStorage(file);
      }

      const newComment = {
        name: user.name || "Anon",
        profileImg: user.profileImg,
        content: bodyComment.trim(),
        bodyImg: uploadedImg,
      };

      await uploadComment(newComment);

      setFile(null);
      setBodyComment("");
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
    } finally {
      setIsSending(false);
    }
  };

  // Función Admin: Borrar base de datos completa
  const handleClearDatabase = async () => {
    if (!isAdmin || isDeletingDb) return;
    const confirmDelete = window.confirm(
      "⚠️ ¿Estás seguro de que deseas eliminar TODOS los mensajes de Supabase? Esta acción es irreversible."
    );
    if (!confirmDelete) return;

    try {
      setIsDeletingDb(true);
      await clearAllComments();
      setComments([]);
      setShowAdminPanel(false);
    } catch (err: any) {
      alert("Error al borrar la base de datos: " + (err?.message || err));
    } finally {
      setIsDeletingDb(false);
    }
  };

  // Función Admin: Enviar Anuncio Global del Sistema
  const handleSendAnnouncement = async () => {
    if (!isAdmin || !announcementText.trim() || isSendingAnnouncement) return;
    try {
      setIsSendingAnnouncement(true);
      await sendSystemAnnouncement(announcementText.trim());
      setAnnouncementText("");
      setShowAdminPanel(false);
    } catch (err: any) {
      alert("Error enviando anuncio: " + (err?.message || err));
    } finally {
      setIsSendingAnnouncement(false);
    }
  };

  const uniqueUsersCount = new Set(comments.map((c) => c.name)).size;

  return (
    <section className="text-slate-800 dark:text-palette-janna bg-white dark:bg-palette-eden-dark h-full w-full flex flex-col flex-1 min-h-0 overflow-hidden relative transition-colors duration-300">
      {/* iOS Navigation Header */}
      <header className="px-4 py-2.5 bg-white/80 dark:bg-palette-eden-dark/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-palette-eden/60 flex justify-between items-center shrink-0 z-10 sticky top-0 transition-colors">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative">
            <img
              src={user.profileImg}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-palette-sinbad/40 shrink-0 shadow-2xs"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-palette-eden-dark rounded-full"></span>
          </div>

          <div className="min-w-0 leading-tight">
            <div className="flex items-center gap-1.5">
              <h3 className="text-[14.5px] font-semibold text-slate-900 dark:text-palette-janna tracking-tight truncate">
                @{user.name}
              </h3>
              {isAdmin && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9.5px] font-bold bg-palette-bondi-light dark:bg-palette-bondi/20 text-palette-bondi dark:text-palette-sinbad border border-palette-bondi/30 dark:border-palette-bondi/40 shadow-2xs">
                  <IoShieldCheckmark size={11} /> ADMIN
                </span>
              )}
            </div>
            <p className="text-[11px] text-palette-bondi dark:text-palette-sinbad font-medium">
              iMessage • En línea
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Botón rápido para alternar tema */}
          <button
            onClick={() => {
              if (theme === "system") setTheme("dark");
              else if (theme === "dark") setTheme("light");
              else setTheme("system");
            }}
            title={`Tema actual: ${theme.toUpperCase()} (Clic para alternar)`}
            className="p-2 rounded-full bg-slate-100 dark:bg-palette-eden hover:bg-slate-200/80 dark:hover:bg-palette-eden-card text-slate-600 dark:text-palette-sinbad transition active:scale-95 cursor-pointer"
          >
            {theme === "dark" ? (
              <IoMoonOutline size={17} />
            ) : theme === "light" ? (
              <IoSunnyOutline size={17} />
            ) : (
              <IoPhonePortraitOutline size={17} />
            )}
          </button>

          {/* Botón de Ajustes para axeladmin */}
          {isAdmin && (
            <button
              onClick={() => setShowAdminPanel(true)}
              title="Panel de Administrador"
              className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-palette-eden hover:bg-slate-200/80 dark:hover:bg-palette-eden-card text-palette-bondi dark:text-palette-sinbad border border-slate-200/60 dark:border-palette-eden/80 px-2.5 py-1.5 rounded-full font-medium transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <IoShieldCheckmark size={14} />
              <span className="hidden sm:inline font-semibold">Admin</span>
            </button>
          )}

          <button
            onClick={resetUser}
            title="Cerrar sesión"
            className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-palette-eden transition active:scale-95 cursor-pointer"
          >
            <IoLogOutOutline size={20} />
          </button>
        </div>
      </header>

      {/* Modal / Action Sheet de Panel de Administración para axeladmin */}
      {showAdminPanel && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 dark:bg-palette-eden-card/95 backdrop-blur-2xl border border-slate-200 dark:border-palette-eden/60 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-800 dark:text-palette-janna">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-palette-eden pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-palette-bondi-light dark:bg-palette-bondi/20 text-palette-bondi dark:text-palette-sinbad rounded-xl">
                  <IoShieldCheckmark size={18} />
                </span>
                <h3 className="text-[15px] font-bold text-slate-900 dark:text-palette-janna">Ajustes de Administrador</h3>
              </div>
              <button
                onClick={() => setShowAdminPanel(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-palette-eden"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            {/* Selector de Tema en Admin */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-palette-sinbad uppercase tracking-wider">
                Preferencia de Tema
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-palette-eden-darker p-1 rounded-2xl border border-slate-200/60 dark:border-palette-eden/60">
                {(["system", "light", "dark"] as ThemeMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setTheme(mode)}
                    className={`py-1.5 text-xs font-semibold rounded-xl capitalize transition active:scale-95 ${
                      theme === mode
                        ? "bg-white dark:bg-palette-bondi text-palette-bondi dark:text-white shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-palette-janna"
                    }`}
                  >
                    {mode === "system" ? "Auto" : mode === "light" ? "Claro" : "Oscuro"}
                  </button>
                ))}
              </div>
            </div>

            {/* Estadísticas del Chat (iOS Segmented Cards) */}
            <div className="grid grid-cols-2 gap-2.5 bg-slate-50 dark:bg-palette-eden-darker p-3 rounded-2xl border border-slate-200/60 dark:border-palette-eden/60">
              <div>
                <p className="text-[10.5px] font-semibold text-slate-400 dark:text-palette-sinbad/70 uppercase tracking-wider">Mensajes</p>
                <p className="text-lg font-bold text-slate-900 dark:text-palette-janna">{comments.length}</p>
              </div>
              <div>
                <p className="text-[10.5px] font-semibold text-slate-400 dark:text-palette-sinbad/70 uppercase tracking-wider">Participantes</p>
                <p className="text-lg font-bold text-palette-bondi dark:text-palette-sinbad">{uniqueUsersCount}</p>
              </div>
            </div>

            {/* Enviar Comunicado Oficial */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-palette-sinbad uppercase tracking-wider flex items-center gap-1.5">
                <VscMegaphone className="text-palette-bondi" /> Anuncio Global
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Escribe un anuncio..."
                  className="bg-slate-50 dark:bg-palette-eden-darker border border-slate-200 dark:border-palette-eden rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-palette-janna placeholder-slate-400 dark:placeholder-slate-500 flex-1 focus:outline-none focus:border-palette-bondi focus:bg-white dark:focus:bg-palette-eden-darker"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendAnnouncement();
                  }}
                />
                <button
                  onClick={handleSendAnnouncement}
                  disabled={!announcementText.trim() || isSendingAnnouncement}
                  className="bg-palette-bondi hover:bg-palette-bondi-hover text-white text-xs px-3 py-2 rounded-xl font-medium transition disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  {isSendingAnnouncement ? "..." : "Enviar"}
                </button>
              </div>
            </div>

            {/* Zona de Peligro: Reset de BD */}
            <div className="border-t border-slate-100 dark:border-palette-eden pt-3 space-y-2">
              <button
                onClick={handleClearDatabase}
                disabled={isDeletingDb}
                className="w-full py-2.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 active:scale-98 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-300 text-xs font-semibold rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <VscTrash size={15} />
                {isDeletingDb ? "Borrando mensajes..." : "Vaciar Base de Datos"}
              </button>

              <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 pt-1 font-medium">
                Desarrollado con ❤️ por <span className="text-palette-bondi dark:text-palette-sinbad font-semibold">Axel Quintana</span>
              </p>
            </div>
          </div>
        </div>
      )}


      {/* Lista de Comentarios */}
      <div className="flex-1 min-h-0 overflow-hidden bg-gradient-to-b from-slate-50/50 to-white dark:from-palette-eden-dark dark:to-palette-eden-darker flex flex-col transition-colors">
        <BodyComments />
      </div>

      {/* Archivo adjunto seleccionado (iOS Pill) */}
      {file && (
        <div className="bg-palette-sinbad-bubble dark:bg-palette-eden-card border-t border-palette-sinbad/40 dark:border-palette-eden text-xs px-4 py-2 flex justify-between items-center text-palette-eden-text dark:text-palette-sinbad shrink-0 animate-in fade-in transition-colors">
          <span className="truncate max-w-[80%] font-medium">📎 {file.name}</span>
          <button
            onClick={() => setFile(null)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold p-0.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-palette-eden transition cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* iOS iMessage Bottom Bar */}
      <div className="flex items-center gap-2 p-2 sm:px-3 sm:py-2.5 bg-white/85 dark:bg-palette-eden-dark/85 backdrop-blur-xl border-t border-slate-200/70 dark:border-palette-eden/60 shrink-0 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-colors">
        <label
          htmlFor="chat-img-file"
          className="text-palette-bondi dark:text-palette-sinbad bg-slate-100 dark:bg-palette-eden hover:bg-slate-200/80 dark:hover:bg-palette-eden-card active:scale-95 cursor-pointer w-8 h-8 rounded-full transition shrink-0 flex items-center justify-center shadow-2xs"
          title="Adjuntar foto"
        >
          <FaPlus size={14} />
        </label>
        <input
          type="file"
          id="chat-img-file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="relative flex-1 flex items-center">
          <input
            id="message-input"
            type="text"
            placeholder="iMessage..."
            className="bg-slate-100/90 dark:bg-palette-eden-darker hover:bg-slate-100 dark:hover:bg-palette-eden-darker focus:bg-white dark:focus:bg-palette-eden-darker border border-slate-200/80 dark:border-palette-eden/80 focus:border-palette-bondi rounded-full pl-4 pr-10 py-2 w-full text-slate-900 dark:text-palette-janna placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition text-[16px] sm:text-[14.5px] leading-normal focus:ring-3 focus:ring-palette-bondi/10 shadow-inner"
            value={bodyComment}
            onChange={(e) => setBodyComment(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
            autoComplete="off"
          />

          {(bodyComment.trim() || file) && (
            <button
              onClick={sendComment}
              disabled={isSending}
              className="absolute right-1.5 flex items-center justify-center bg-palette-bondi hover:bg-palette-bondi-hover active:scale-90 text-white rounded-full w-7 h-7 shrink-0 transition shadow-sm shadow-palette-bondi/40 disabled:opacity-40 cursor-pointer"
            >
              <VscSend size={14} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}






