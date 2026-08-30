import { User, Comment, CommentRes } from "../types";
import { create } from "zustand";
import { persist } from "zustand/middleware"; // Middleware para persistencia

export type ThemeMode = "system" | "light" | "dark";

export type CommentState = {
  user: User;
  comment: Comment;
  comments: CommentRes[];
  theme: ThemeMode;
  setUser: (data: User) => void;
  setComment: (data: Comment) => void;
  setComments: (data: CommentRes[]) => void;
  addComment: (data: CommentRes) => void;
  removeComment: (id: number) => void;
  setTheme: (theme: ThemeMode) => void;
  resetUser: () => void;
};

export const initialCommentState = {
  user: {
    name: "",
    profileImg: "",
  },
  comments: [],
  theme: "system" as ThemeMode,
  comment: {
    name: "",
    profileImg: "",
    content: "",
    bodyImg: "",
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
        })),

      // Acción para cambiar tema (system / light / dark)
      setTheme: (theme) =>
        set(() => ({
          theme,
        })),

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
    }
  )
);



