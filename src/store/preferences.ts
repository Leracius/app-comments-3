import { User, Comment, CommentRes, ChatRoom } from "../types";
import { create } from "zustand";
import { persist } from "zustand/middleware"; // Middleware para persistencia

export type ThemeMode = "system" | "light" | "dark";

export type InAppBannerData = {
  title: string;
  message: string;
  avatar: string;
  roomId: string;
};

export type CommentState = {
  user: User;
  comment: Comment;
  comments: CommentRes[];
  theme: ThemeMode;
  currentRoom: string;
  privateRooms: ChatRoom[];
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  inAppBanner: InAppBannerData | null;
  setUser: (data: User) => void;
  setComment: (data: Comment) => void;
  setComments: (data: CommentRes[]) => void;
  addComment: (data: CommentRes) => void;
  removeComment: (id: number) => void;
  setTheme: (theme: ThemeMode) => void;
  setCurrentRoom: (roomId: string) => void;
  addPrivateRoom: (room: ChatRoom) => void;
  removePrivateRoom: (roomId: string) => void;
  toggleSound: () => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setInAppBanner: (banner: InAppBannerData) => void;
  clearInAppBanner: () => void;
  resetUser: () => void;
};

export const initialCommentState = {
  user: {
    name: "",
    profileImg: "",
  },
  comments: [],
  theme: "system" as ThemeMode,
  currentRoom: "general",
  privateRooms: [] as ChatRoom[],
  soundEnabled: true,
  notificationsEnabled: false,
  inAppBanner: null as InAppBannerData | null,
  comment: {
    name: "",
    profileImg: "",
    content: "",
    bodyImg: "",
    room: "general",
  },
};

export const CommentStore = create<CommentState>()(
  persist(
    (set) => ({
      ...initialCommentState,

      // Acción para actualizar el usuario
      setUser: (data) =>
        set(() => ({
          user: data,
        })),

      resetUser: () =>
        set(() => ({
          user: { name: "", profileImg: "" },
          currentRoom: "general",
        })),

      // Acción para cambiar tema (system / light / dark)
      setTheme: (theme) =>
        set(() => ({
          theme,
        })),

      // Acción para alternar sonido
      toggleSound: () =>
        set((state) => ({
          soundEnabled: !state.soundEnabled,
        })),

      // Acción para actualizar permiso de notificaciones nativas
      setNotificationsEnabled: (enabled) =>
        set(() => ({
          notificationsEnabled: enabled,
        })),

      // Acción para mostrar banner in-app
      setInAppBanner: (banner) =>
        set(() => ({
          inAppBanner: banner,
        })),

      // Acción para limpiar banner in-app
      clearInAppBanner: () =>
        set(() => ({
          inAppBanner: null,
        })),

      // Acción para cambiar de sala / conversación
      setCurrentRoom: (roomId) =>
        set(() => ({
          currentRoom: roomId,
          comments: [], // limpiar vista previa mientras carga la nueva sala
          inAppBanner: null, // cerrar banner si se entra a la sala
        })),

      // Acción para agregar una conversación privada a la lista
      addPrivateRoom: (room) =>
        set((state) => {
          const exists = state.privateRooms.some((r) => r.id === room.id);
          if (exists) {
            return { currentRoom: room.id };
          }
          return {
            privateRooms: [room, ...state.privateRooms],
            currentRoom: room.id,
          };
        }),

      // Acción para eliminar / cerrar un chat privado
      removePrivateRoom: (roomId) =>
        set((state) => {
          const remaining = state.privateRooms.filter((r) => r.id !== roomId);
          return {
            privateRooms: remaining,
            currentRoom: state.currentRoom === roomId ? "general" : state.currentRoom,
          };
        }),

      // Acción para actualizar el comentario
      setComment: (data) =>
        set(() => ({
          comment: data,
        })),

      // Acción para actualizar los comentarios completos
      setComments: (data) =>
        set(() => ({
          comments: data,
        })),

      // Acción para agregar un comentario en tiempo real (evitando duplicados)
      addComment: (newMsg) =>
        set((state) => {
          const exists = state.comments.some((c) => c.id === newMsg.id);
          if (exists) return state;
          return {
            comments: [...state.comments, newMsg],
          };
        }),

      // Acción para eliminar un comentario del estado
      removeComment: (id) =>
        set((state) => ({
          comments: state.comments.filter((c) => c.id !== id),
        })),
    }),
    {
      name: "comment-storage",
      partialize: (state) => ({
        user: state.user,
        theme: state.theme,
        soundEnabled: state.soundEnabled,
        notificationsEnabled: state.notificationsEnabled,
        privateRooms: state.privateRooms,
      }),
    }
  )
);





