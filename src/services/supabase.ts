import { supabase } from "../supabaseClient";
import { Comment, CommentRes } from "../types";
import { handleUpload } from "./cloudinary";

export { supabase };

// 1. Obtener comentarios filtrados por sala (por defecto 'general')
export const getComments = async (room: string = "general"): Promise<CommentRes[]> => {
  try {
    let query = supabase.from("comments").select("*");

    if (!room || room === "general") {
      query = query.or("room.eq.general,room.is.null");
    } else {
      query = query.eq("room", room);
    }

    const { data, error } = await query.order("createdAt", { ascending: true });

    if (error) {
      console.error("Error obteniendo comentarios:", error.message);
      return [];
    }

    return (data as CommentRes[]) || [];
  } catch (err) {
    console.error("Error inesperado en getComments:", err);
    return [];
  }
};

// 2. Enviar / publicar un nuevo comentario en la sala indicada
export const uploadComment = async (comment: Comment) => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .insert([
        {
          name: comment.name,
          profileImg: comment.profileImg,
          content: comment.content,
          bodyImg: comment.bodyImg || "",
          room: comment.room || "general",
        },
      ])
      .select();

    if (error) {
      console.error("Error insertando comentario en Supabase:", error.message);
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Error al enviar comentario:", err);
    throw err;
  }
};

// 3. Subir imagen a Supabase Storage con fallback a Cloudinary
export const uploadImageToStorage = async (file: File): Promise<string> => {
  try {
    const fileExt = file.name.split(".").pop();
    const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `chat/${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("chat-images")
      .upload(filePath, file);

    if (!uploadError) {
      const { data } = supabase.storage
        .from("chat-images")
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        return data.publicUrl;
      }
    } else {
      console.warn("Supabase Storage no disponible o sin bucket, usando Cloudinary fallback:", uploadError.message);
    }
  } catch (storageErr) {
    console.warn("Fallo subida a Supabase Storage, intentando Cloudinary:", storageErr);
  }

  // Fallback a Cloudinary
  try {
    const cloudRes = await handleUpload(file);
    return cloudRes?.secure_url || "";
  } catch (cloudErr) {
    console.error("Error subiendo imagen a Cloudinary:", cloudErr);
    return "";
  }
};

// 4. Borrar comentarios de la base de datos (por sala o completa)
export const clearAllComments = async (room?: string): Promise<boolean> => {
  try {
    let query = supabase.from("comments").delete();

    if (room && room !== "all") {
      if (room === "general") {
        query = query.or("room.eq.general,room.is.null");
      } else {
        query = query.eq("room", room);
      }
    } else {
      query = query.gte("id", 0);
    }

    const { error } = await query;

    if (error) {
      console.error("Error al borrar comentarios:", error.message);
      throw error;
    }
    return true;
  } catch (err) {
    console.error("Error en clearAllComments:", err);
    throw err;
  }
};

// 5. Borrar un comentario individual (Función Admin / Moderación)
export const deleteSingleComment = async (commentId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.error("Error al borrar comentario individual:", error.message);
      throw error;
    }
    return true;
  } catch (err) {
    console.error("Error en deleteSingleComment:", err);
    throw err;
  }
};

// 6. Enviar anuncio oficial del sistema (Función Admin)
export const sendSystemAnnouncement = async (announcement: string, room: string = "general"): Promise<any> => {
  return await uploadComment({
    name: "SISTEMA",
    profileImg: "https://api.dicebear.com/7.x/bottts/svg?seed=SYSTEM_ADMIN_CORE",
    content: `📢 [ANUNCIO OFICIAL]: ${announcement}`,
    bodyImg: "",
    room,
  });
};




