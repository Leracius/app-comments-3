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
  IoChatbubblesOutline,
  IoCreateOutline,
  IoLockClosedOutline,
  IoGlobeOutline,
  IoChevronDownOutline,
  IoNotificationsOutline,
  IoNotificationsOffOutline,
} from "react-icons/io5";

import { useEffect, useState, useRef, KeyboardEvent } from "react";
import BodyComments from "./BodyComments";
import {
  getComments,
  uploadComment,
  uploadImageToStorage,
  clearAllComments,
  sendSystemAnnouncement,
  supabase,
} from "../services/supabase";
import { CommentRes, ChatRoom } from "../types";
import {
  playIncomingMessageSound,
  playOutgoingMessageSound,
  requestNotificationPermission,
  sendBrowserNotification,
} from "../utils/notifications";


export default function CommentInput() {
  const {
    user,
    comments,
    theme,
    currentRoom,
    privateRooms,
    soundEnabled,
    notificationsEnabled,
    setTheme,
    toggleSound,
    setNotificationsEnabled,
    setInAppBanner,
    setCurrentRoom,
    addPrivateRoom,
    removePrivateRoom,
    setComments,
    addComment,
    resetUser,
  } = CommentStore();

  const [bodyComment, setBodyComment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Modales
  const [showRoomSelector, setShowRoomSelector] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Estados para nuevo chat privado
  const [chatTypeTab, setChatTypeTab] = useState<"dm" | "room">("dm");
  const [targetUsername, setTargetUsername] = useState("");
  const [roomNameInput, setRoomNameInput] = useState("");
  const [roomPasscode, setRoomPasscode] = useState("");

  // Estados de Admin
  const [announcementText, setAnnouncementText] = useState("");
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false);
  const [isDeletingDb, setIsDeletingDb] = useState(false);

  const unreadCountRef = useRef(0);
  const isAdmin = user.name?.trim().toLowerCase() === "axeladmin";

  // Identificar información de la sala actual
  const activePrivateRoom = privateRooms.find((r) => r.id === currentRoom);
  const isPrivate = currentRoom !== "general";

  // 1. Manejo de foco y título de la pestaña para contador de no leídos
  useEffect(() => {
    const handleFocus = () => {
      unreadCountRef.current = 0;
      document.title = "Realtime Chat App";
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        handleFocus();
      }
    });

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // 2. Cargar comentarios cada vez que se cambia de sala
  useEffect(() => {
    let isMounted = true;
    const loadRoomComments = async () => {
      const data = await getComments(currentRoom);
      if (isMounted) {
        setComments(data);
      }
    };
    loadRoomComments();
    return () => {
      isMounted = false;
    };
  }, [currentRoom, setComments]);

  // 3. Suscribirse a eventos Realtime de Supabase con Notificaciones
  useEffect(() => {
    const channel = supabase
      .channel("realtime-comments-global")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comments" },
        (payload) => {
          const newMsg = payload.new as CommentRes;
          const msgRoom = newMsg?.room || "general";
          const isFromOther =
            newMsg.name?.trim().toLowerCase() !== user.name?.trim().toLowerCase();

          // Si el mensaje pertenece a la sala actual, agregarlo en vivo
          if (
            msgRoom === currentRoom ||
            (msgRoom === "general" && currentRoom === "general")
          ) {
            addComment(newMsg);
          }

          // Si es un mensaje de otro usuario:
          if (isFromOther) {
            // A) Reproducir sonido
            if (soundEnabled) {
              playIncomingMessageSound();
            }

            // B) Notificación nativa del navegador si la pestaña está oculta
            if (document.hidden) {
              unreadCountRef.current += 1;
              document.title = `(${unreadCountRef.current}) 💬 Mensaje de @${newMsg.name} - Realtime Chat`;

              sendBrowserNotification(
                `💬 Nuevo mensaje de @${newMsg.name}`,
                newMsg.content || "📷 Foto adjunta",
                newMsg.profileImg,
                () => {
                  if (msgRoom !== currentRoom) {
                    setCurrentRoom(msgRoom);
                  }
                }
              );
            }

            // C) Si el mensaje es para otra sala / DM, mostrar Banner In-App
            if (
              msgRoom !== currentRoom &&
              !(msgRoom === "general" && currentRoom === "general")
            ) {
              setInAppBanner({
                title: `@${newMsg.name}`,
                message: newMsg.content || "📷 Foto adjunta",
                avatar: newMsg.profileImg,
                roomId: msgRoom,
              });
            }
          }

          // Si es un mensaje directo para el usuario en otra conversación privada, auto-descubrir la sala
          if (msgRoom.startsWith("dm:")) {
            const participants = msgRoom.replace("dm:", "").split("_");
            const myNameLower = user.name.trim().toLowerCase();
            if (participants.includes(myNameLower)) {
              const otherUser = participants.find((p) => p !== myNameLower) || "Chat";
              addPrivateRoom({
                id: msgRoom,
                name: otherUser.charAt(0).toUpperCase() + otherUser.slice(1),
                isPrivate: true,
                recipient: otherUser,
                avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(otherUser)}`,
              });
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "comments" },
        () => {
          // Recargar comentarios de la sala actual tras un borrado
          getComments(currentRoom).then(setComments);
        }
      )
      .subscribe((status) => {
        console.log("Estado Realtime:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    currentRoom,
    user.name,
    soundEnabled,
    addComment,
    addPrivateRoom,
    setCurrentRoom,
    setInAppBanner,
    setComments,
  ]);

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
        room: currentRoom,
      };

      await uploadComment(newComment);

      if (soundEnabled) {
        playOutgoingMessageSound();
      }

      setFile(null);
      setBodyComment("");
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
    } finally {
      setIsSending(false);
    }
  };

  // Solicitar permiso para notificaciones web
  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      setNotificationsEnabled(granted);
      if (granted) {
        sendBrowserNotification(
          "🔔 Notificaciones activadas",
          "Te avisaremos cuando recibas nuevos mensajes mientras estés en otra pestaña."
        );
      }
    } else {
      setNotificationsEnabled(false);
    }
  };


  // Crear o unirse a un Chat Privado 1-a-1
  const handleStartDM = () => {
    const target = targetUsername.trim();
    if (!target) return;
    if (target.toLowerCase() === user.name.trim().toLowerCase()) {
      alert("No puedes iniciar un chat privado contigo mismo.");
      return;
    }

    const participants = [user.name.trim().toLowerCase(), target.toLowerCase()].sort();
    const dmRoomId = `dm:${participants[0]}_${participants[1]}`;

    const newRoom: ChatRoom = {
      id: dmRoomId,
      name: target.charAt(0).toUpperCase() + target.slice(1),
      isPrivate: true,
      recipient: target,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(target)}`,
    };

    addPrivateRoom(newRoom);
    setTargetUsername("");
    setShowNewChatModal(false);
  };

  // Crear o unirse a una Sala Privada con Código
  const handleCreatePrivateRoom = () => {
    const name = roomNameInput.trim();
    if (!name) return;

    const roomId = `room:${name.toLowerCase().replace(/\s+/g, "-")}`;
    const newRoom: ChatRoom = {
      id: roomId,
      name: name,
      isPrivate: true,
      passcode: roomPasscode.trim(),
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`,
    };

    addPrivateRoom(newRoom);
    setRoomNameInput("");
    setRoomPasscode("");
    setShowNewChatModal(false);
  };

  // Función Admin: Borrar base de datos
  const handleClearDatabase = async () => {
    if (!isAdmin || isDeletingDb) return;
    const confirmDelete = window.confirm(
      "⚠️ ¿Estás seguro de que deseas eliminar los mensajes de Supabase? Esta acción es irreversible."
    );
    if (!confirmDelete) return;

    try {
      setIsDeletingDb(true);
      await clearAllComments(currentRoom);
      setComments([]);
      setShowAdminPanel(false);
    } catch (err: any) {
      alert("Error al borrar la base de datos: " + (err?.message || err));
    } finally {
      setIsDeletingDb(false);
    }
  };

  // Función Admin: Enviar Anuncio Global
  const handleSendAnnouncement = async () => {
    if (!isAdmin || !announcementText.trim() || isSendingAnnouncement) return;
    try {
      setIsSendingAnnouncement(true);
      await sendSystemAnnouncement(announcementText.trim(), currentRoom);
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
      <header className="px-3.5 py-2.5 bg-white/85 dark:bg-palette-eden-dark/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-palette-eden/60 flex justify-between items-center shrink-0 z-10 sticky top-0 transition-colors">
        {/* Selector de Conversación / Información de la Sala */}
        <button
          onClick={() => setShowRoomSelector(true)}
          className="flex items-center gap-2.5 min-w-0 text-left hover:bg-slate-100/80 dark:hover:bg-palette-eden/80 p-1.5 -ml-1.5 rounded-2xl transition active:scale-98 cursor-pointer"
          title="Cambiar de conversación o sala"
        >
          <div className="relative">
            <img
              src={
                isPrivate
                  ? activePrivateRoom?.avatar ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                      activePrivateRoom?.name || "Chat"
                    )}`
                  : user.profileImg
              }
              alt="Avatar"
              className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-palette-sinbad/40 shrink-0 shadow-2xs"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-palette-eden-dark rounded-full"></span>
          </div>

          <div className="min-w-0 leading-tight">
            <div className="flex items-center gap-1">
              <h3 className="text-[14px] font-bold text-slate-900 dark:text-palette-janna tracking-tight truncate max-w-[130px] sm:max-w-[180px]">
                {isPrivate ? activePrivateRoom?.name : "# General"}
              </h3>
              <IoChevronDownOutline size={14} className="text-slate-400 dark:text-palette-sinbad shrink-0" />
              {isAdmin && !isPrivate && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-palette-bondi-light dark:bg-palette-bondi/20 text-palette-bondi dark:text-palette-sinbad border border-palette-bondi/30 shadow-2xs">
                  <IoShieldCheckmark size={10} /> ADMIN
                </span>
              )}
            </div>
            <p className="text-[11px] text-palette-bondi dark:text-palette-sinbad font-medium truncate">
              {isPrivate ? "🔒 Chat Privado" : "🌐 Chat Público • En línea"}
            </p>
          </div>
        </button>

        {/* Acciones del Header */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Botón para Redactar / Iniciar Chat Privado */}
          <button
            onClick={() => setShowNewChatModal(true)}
            title="Nuevo Chat Privado"
            className="flex items-center gap-1 text-xs bg-palette-bondi-light dark:bg-palette-bondi/20 hover:bg-palette-bondi-light/80 dark:hover:bg-palette-bondi/30 text-palette-bondi dark:text-palette-sinbad border border-palette-bondi/30 px-2.5 py-1.5 rounded-full font-semibold transition active:scale-95 cursor-pointer shadow-2xs"
          >
            <IoCreateOutline size={16} />
            <span className="hidden sm:inline">Nuevo Chat</span>
          </button>

          {/* Botón para alternar sonido (Campana) */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? "Sonido Activado (Clic para silenciar)" : "Sonido Silenciado (Clic para activar)"}
            className={`p-2 rounded-full border transition active:scale-95 cursor-pointer ${
              soundEnabled
                ? "bg-palette-bondi-light/70 dark:bg-palette-bondi/20 text-palette-bondi dark:text-palette-sinbad border-palette-bondi/30"
                : "bg-slate-100 dark:bg-palette-eden text-slate-400 dark:text-slate-500 border-transparent"
            }`}
          >
            {soundEnabled ? (
              <IoNotificationsOutline size={17} />
            ) : (
              <IoNotificationsOffOutline size={17} />
            )}
          </button>

          {/* Botón rápido para alternar tema */}
          <button
            onClick={() => {
              if (theme === "system") setTheme("dark");
              else if (theme === "dark") setTheme("light");
              else setTheme("system");
            }}
            title={`Tema: ${theme.toUpperCase()}`}
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
              className="flex items-center gap-1 text-xs bg-slate-100 dark:bg-palette-eden hover:bg-slate-200/80 dark:hover:bg-palette-eden-card text-palette-bondi dark:text-palette-sinbad border border-slate-200/60 dark:border-palette-eden/80 p-2 rounded-full font-medium transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <IoShieldCheckmark size={15} />
            </button>
          )}

          <button
            onClick={resetUser}
            title="Cerrar sesión"
            className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-palette-eden transition active:scale-95 cursor-pointer"
          >
            <IoLogOutOutline size={19} />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 1. Modal / Action Sheet: Selector de Conversaciones & Salas (iOS Style)    */}
      {/* ========================================================================= */}
      {showRoomSelector && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 dark:bg-palette-eden-card/95 backdrop-blur-2xl border border-slate-200 dark:border-palette-eden/60 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-800 dark:text-palette-janna">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-palette-eden pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-palette-bondi-light dark:bg-palette-bondi/20 text-palette-bondi dark:text-palette-sinbad rounded-xl">
                  <IoChatbubblesOutline size={18} />
                </span>
                <h3 className="text-[15px] font-bold text-slate-900 dark:text-palette-janna">
                  Tus Conversaciones
                </h3>
              </div>
              <button
                onClick={() => setShowRoomSelector(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-palette-eden"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {/* Sala Global / Pública */}
              <button
                onClick={() => {
                  setCurrentRoom("general");
                  setShowRoomSelector(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition active:scale-98 ${
                  currentRoom === "general"
                    ? "bg-palette-bondi text-white border-palette-bondi shadow-sm"
                    : "bg-slate-50 dark:bg-palette-eden-darker hover:bg-slate-100 dark:hover:bg-palette-eden border-slate-200/80 dark:border-palette-eden/60 text-slate-800 dark:text-palette-janna"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-palette-bondi-light dark:bg-palette-bondi/20 flex items-center justify-center text-palette-bondi dark:text-palette-sinbad text-lg">
                    <IoGlobeOutline />
                  </div>
                  <div>
                    <p className="text-sm font-bold"># General</p>
                    <p className={`text-[11px] ${currentRoom === "general" ? "text-white/80" : "text-slate-400 dark:text-palette-sinbad/70"}`}>
                      Chat público de la comunidad
                    </p>
                  </div>
                </div>
                {currentRoom === "general" && <span className="text-xs font-bold">Activo</span>}
              </button>

              {/* Lista de Chats Privados */}
              {privateRooms.length > 0 && (
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-palette-sinbad uppercase tracking-wider mb-2 pl-1">
                    Chats Privados
                  </p>
                  <div className="space-y-1.5">
                    {privateRooms.map((room) => (
                      <div
                        key={room.id}
                        className={`flex items-center justify-between p-2.5 rounded-2xl border transition ${
                          currentRoom === room.id
                            ? "bg-palette-bondi text-white border-palette-bondi shadow-sm"
                            : "bg-slate-50 dark:bg-palette-eden-darker hover:bg-slate-100 dark:hover:bg-palette-eden border-slate-200/80 dark:border-palette-eden/60 text-slate-800 dark:text-palette-janna"
                        }`}
                      >
                        <button
                          onClick={() => {
                            setCurrentRoom(room.id);
                            setShowRoomSelector(false);
                          }}
                          className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                        >
                          <img
                            src={room.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(room.name)}`}
                            alt={room.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-palette-sinbad/40 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">@{room.name}</p>
                            <p className={`text-[10px] truncate ${currentRoom === room.id ? "text-white/80" : "text-slate-400"}`}>
                              {room.recipient ? `Mensaje Directo` : `Sala Privada`}
                            </p>
                          </div>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePrivateRoom(room.id);
                          }}
                          title="Cerrar conversación"
                          className={`p-1.5 rounded-lg hover:bg-red-500/20 text-xs transition ${
                            currentRoom === room.id ? "text-white/80 hover:text-white" : "text-slate-400 hover:text-red-500"
                          }`}
                        >
                          <IoCloseOutline size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-palette-eden">
              {/* Botón para solicitar notificaciones web */}
              <button
                onClick={handleToggleNotifications}
                className="w-full py-2.5 bg-slate-100 dark:bg-palette-eden hover:bg-slate-200/80 dark:hover:bg-palette-eden-card text-slate-700 dark:text-palette-janna text-xs font-semibold rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <IoNotificationsOutline size={15} className="text-palette-bondi" />
                {notificationsEnabled
                  ? "🔔 Notificaciones Web: Activas"
                  : "🔔 Activar Notificaciones Web"}
              </button>

              <button
                onClick={() => {
                  setShowRoomSelector(false);
                  setShowNewChatModal(true);
                }}
                className="w-full py-3 bg-palette-bondi hover:bg-palette-bondi-hover active:scale-98 text-white text-xs font-bold rounded-2xl transition shadow-md shadow-palette-bondi/25 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <IoCreateOutline size={16} />
                Iniciar Nueva Conversación Privada
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Modal: Iniciar Nueva Conversación Privada (1-a-1 o Sala con PIN)       */}
      {/* ========================================================================= */}
      {showNewChatModal && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 dark:bg-palette-eden-card/95 backdrop-blur-2xl border border-slate-200 dark:border-palette-eden/60 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-800 dark:text-palette-janna">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-palette-eden pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-palette-bondi-light dark:bg-palette-bondi/20 text-palette-bondi dark:text-palette-sinbad rounded-xl">
                  <IoLockClosedOutline size={18} />
                </span>
                <h3 className="text-[15px] font-bold text-slate-900 dark:text-palette-janna">
                  Nueva Conversación Privada
                </h3>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-palette-eden"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            {/* Selector de tipo de chat (Tabs iOS) */}
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-palette-eden-darker p-1 rounded-2xl border border-slate-200/60 dark:border-palette-eden/60">
              <button
                onClick={() => setChatTypeTab("dm")}
                className={`py-1.5 text-xs font-semibold rounded-xl transition ${
                  chatTypeTab === "dm"
                    ? "bg-white dark:bg-palette-bondi text-palette-bondi dark:text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                Chat Directo (1 a 1)
              </button>
              <button
                onClick={() => setChatTypeTab("room")}
                className={`py-1.5 text-xs font-semibold rounded-xl transition ${
                  chatTypeTab === "room"
                    ? "bg-white dark:bg-palette-bondi text-palette-bondi dark:text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                Sala con Código
              </button>
            </div>

            {chatTypeTab === "dm" ? (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-palette-sinbad uppercase tracking-wider mb-1.5 pl-1">
                    ¿Con quién deseas hablar?
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Lucas, Satoshi, Maria..."
                    className="bg-slate-50 dark:bg-palette-eden-darker border border-slate-200 dark:border-palette-eden rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-palette-janna placeholder-slate-400 w-full focus:outline-none focus:border-palette-bondi focus:bg-white"
                    value={targetUsername}
                    onChange={(e) => setTargetUsername(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleStartDM();
                    }}
                    autoFocus
                  />
                  <p className="text-[10.5px] text-slate-400 dark:text-slate-400 mt-1 pl-1">
                    Se creará un canal privado exclusivo y encriptado para ustedes dos.
                  </p>
                </div>

                <button
                  onClick={handleStartDM}
                  disabled={!targetUsername.trim()}
                  className="w-full py-3 bg-palette-bondi hover:bg-palette-bondi-hover active:scale-98 text-white text-xs font-bold rounded-2xl transition disabled:opacity-40 shadow-md shadow-palette-bondi/25 cursor-pointer"
                >
                  Abrir Chat Privado
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-palette-sinbad uppercase tracking-wider mb-1 pl-1">
                    Nombre de la Sala
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Proyecto Secreto, Gaming..."
                    className="bg-slate-50 dark:bg-palette-eden-darker border border-slate-200 dark:border-palette-eden rounded-2xl px-3.5 py-2 text-xs text-slate-800 dark:text-palette-janna placeholder-slate-400 w-full focus:outline-none focus:border-palette-bondi focus:bg-white"
                    value={roomNameInput}
                    onChange={(e) => setRoomNameInput(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-palette-sinbad uppercase tracking-wider mb-1 pl-1">
                    Código / PIN de Acceso (Opcional)
                  </label>
                  <input
                    type="password"
                    placeholder="Ej. 1234"
                    className="bg-slate-50 dark:bg-palette-eden-darker border border-slate-200 dark:border-palette-eden rounded-2xl px-3.5 py-2 text-xs text-slate-800 dark:text-palette-janna placeholder-slate-400 w-full focus:outline-none focus:border-palette-bondi focus:bg-white"
                    value={roomPasscode}
                    onChange={(e) => setRoomPasscode(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleCreatePrivateRoom}
                  disabled={!roomNameInput.trim()}
                  className="w-full py-3 bg-palette-bondi hover:bg-palette-bondi-hover active:scale-98 text-white text-xs font-bold rounded-2xl transition disabled:opacity-40 shadow-md shadow-palette-bondi/25 cursor-pointer"
                >
                  Entrar a la Sala Privada
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. Modal / Action Sheet: Panel de Administración (axeladmin)              */}
      {/* ========================================================================= */}
      {showAdminPanel && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 dark:bg-palette-eden-card/95 backdrop-blur-2xl border border-slate-200 dark:border-palette-eden/60 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-800 dark:text-palette-janna">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-palette-eden pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-palette-bondi-light dark:bg-palette-bondi/20 text-palette-bondi dark:text-palette-sinbad rounded-xl">
                  <IoShieldCheckmark size={18} />
                </span>
                <h3 className="text-[15px] font-bold text-slate-900 dark:text-palette-janna">
                  Ajustes de Administrador
                </h3>
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

            {/* Estadísticas del Chat */}
            <div className="grid grid-cols-2 gap-2.5 bg-slate-50 dark:bg-palette-eden-darker p-3 rounded-2xl border border-slate-200/60 dark:border-palette-eden/60">
              <div>
                <p className="text-[10.5px] font-semibold text-slate-400 dark:text-palette-sinbad/70 uppercase tracking-wider">
                  Mensajes ({isPrivate ? "Sala" : "Global"})
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-palette-janna">{comments.length}</p>
              </div>
              <div>
                <p className="text-[10.5px] font-semibold text-slate-400 dark:text-palette-sinbad/70 uppercase tracking-wider">
                  Participantes
                </p>
                <p className="text-lg font-bold text-palette-bondi dark:text-palette-sinbad">{uniqueUsersCount}</p>
              </div>
            </div>

            {/* Enviar Comunicado Oficial */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-palette-sinbad uppercase tracking-wider flex items-center gap-1.5">
                <VscMegaphone className="text-palette-bondi" /> Anuncio Oficial ({isPrivate ? "En esta sala" : "Global"})
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
                {isDeletingDb ? "Borrando mensajes..." : `Vaciar ${isPrivate ? "esta sala" : "Base de Datos"}`}
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
            placeholder={isPrivate ? `Mensaje privado para @${activePrivateRoom?.name}...` : "iMessage en #General..."}
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







