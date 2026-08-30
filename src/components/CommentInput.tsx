import { CommentStore } from "../store/preferences";
import { VscSend } from "react-icons/vsc";
import { FaRegImage } from "react-icons/fa6";
import { IoLogOutOutline } from "react-icons/io5";
import { useEffect, useState, KeyboardEvent } from "react";
import BodyComments from "./BodyComments";
import {
  getComments,
  uploadComment,
  uploadImageToStorage,
  supabase,
} from "../services/supabase";
import { CommentRes } from "../types";

export default function CommentInput() {
  const { user, setComments, addComment, resetUser } = CommentStore();
  const [bodyComment, setBodyComment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // 1. Cargar comentarios iniciales
    const loadInitialComments = async () => {
      const data = await getComments();
      setComments(data);
    };
    loadInitialComments();

    // 2. Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel("realtime-comments")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments" },
        (payload) => {
          console.log("Nuevo mensaje recibido en tiempo real:", payload.new);
          if (payload.new) {
            addComment(payload.new as CommentRes);
          }
        }
      )
      .subscribe((status) => {
        console.log("Estado de conexión Realtime:", status);
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

  return (
    <section className="text-white bg-slate-950 h-screen w-full flex flex-col border-x border-slate-800 shadow-2xl">
      {/* Header del Chat */}
      <header className="p-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img
            src={user.profileImg}
            alt={user.name}
            className="w-9 h-9 rounded-full object-cover border border-indigo-500"
          />
          <div>
            <h3 className="text-sm font-semibold text-white">@{user.name}</h3>
            <p className="text-[11px] text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
              En línea (Supabase Realtime)
            </p>
          </div>
        </div>

        <button
          onClick={resetUser}
          title="Cambiar usuario"
          className="text-slate-400 hover:text-red-400 p-2 rounded-lg hover:bg-slate-800 transition"
        >
          <IoLogOutOutline size={22} />
        </button>
      </header>

      {/* Lista de Comentarios */}
      <div className="flex-1 overflow-hidden bg-slate-900/50">
        <BodyComments />
      </div>

      {/* Archivo adjunto seleccionado */}
      {file && (
        <div className="bg-indigo-900/60 border-t border-indigo-700/50 text-xs px-3 py-1.5 flex justify-between items-center text-indigo-200">
          <span>📎 {file.name}</span>
          <button
            onClick={() => setFile(null)}
            className="text-indigo-300 hover:text-white font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Barra de envío */}
      <div className="flex items-center gap-2 p-3 bg-slate-950 border-t border-slate-800">
        <label
          htmlFor="chat-img-file"
          className="text-slate-400 hover:text-indigo-400 cursor-pointer p-2 rounded-full hover:bg-slate-800 transition"
          title="Adjuntar imagen"
        >
          <FaRegImage size={20} />
        </label>
        <input
          type="file"
          id="chat-img-file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <input
          id="message-input"
          placeholder="Escribe un mensaje..."
          className="bg-slate-900 border border-slate-800 rounded-full px-4 py-2.5 w-full text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition text-sm"
          value={bodyComment}
          onChange={(e) => setBodyComment(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
        />

        {(bodyComment.trim() || file) && (
          <button
            onClick={sendComment}
            disabled={isSending}
            className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-full w-10 h-10 shrink-0 transition disabled:opacity-50"
          >
            <VscSend size={18} />
          </button>
        )}
      </div>
    </section>
  );
}

