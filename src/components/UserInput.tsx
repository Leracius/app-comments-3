import { CommentStore } from "../store/preferences";
import { useState } from "react";
import { FaRegImage, FaUserCircle } from "react-icons/fa";
import { uploadImageToStorage } from "../services/supabase";

export default function UserInput() {
  const { setUser } = CommentStore();
  const [userName, setUserName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleEnterChat = async () => {
    if (!userName.trim() || isUploading) return;

    try {
      setIsUploading(true);
      let profileUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userName.trim())}`;

      if (file) {
        const uploaded = await uploadImageToStorage(file);
        if (uploaded) {
          profileUrl = uploaded;
        }
      }

      setUser({
        name: userName.trim(),
        profileImg: profileUrl,
      });
    } catch (err) {
      console.error("Error al ingresar usuario:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="bg-white/90 dark:bg-palette-eden-card/90 backdrop-blur-xl w-full max-w-sm mx-auto text-slate-800 dark:text-palette-janna border border-slate-200/80 dark:border-palette-eden/60 rounded-3xl p-6 sm:p-7 shadow-[0_15px_35px_rgba(0,0,0,0.06)] dark:shadow-2xl flex flex-col justify-center my-auto transition-colors duration-300">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-palette-bondi-light dark:bg-palette-bondi/20 text-palette-bondi dark:text-palette-sinbad rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl shadow-sm">
          💬
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-palette-eden-text dark:text-palette-sinbad tracking-tight">
          Bienvenido al Chat
        </h2>
        <p className="text-slate-500 dark:text-palette-janna/70 text-xs sm:text-sm mt-1">
          Configura tu perfil para unirte a la sala
        </p>
      </div>

      <div className="space-y-4 sm:space-y-5">
        <div>
          <label htmlFor="username" className="block text-[11px] font-semibold text-slate-500 dark:text-palette-sinbad uppercase tracking-wider mb-1.5 pl-1">
            Nombre de usuario
          </label>
          <input
            id="username"
            type="text"
            placeholder="Ej. Axel, Lucas, Satoshi..."
            className="bg-slate-50 dark:bg-palette-eden-darker border border-slate-200/90 dark:border-palette-eden/80 focus:border-palette-bondi focus:bg-white dark:focus:bg-palette-eden-darker rounded-2xl p-3.5 w-full text-slate-900 dark:text-palette-janna placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition text-[16px] sm:text-sm focus:ring-4 focus:ring-palette-bondi/10 shadow-inner"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleEnterChat();
            }}
            autoComplete="username"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-palette-sinbad uppercase tracking-wider mb-2 pl-1">
            Foto de perfil (Opcional)
          </label>
          <div className="flex items-center gap-3.5 bg-slate-50/80 dark:bg-palette-eden-darker/70 p-3 rounded-2xl border border-slate-200/60 dark:border-palette-eden/60">
            <div className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-palette-sinbad bg-white dark:bg-palette-eden-dark rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
              {file ? (
                <img
                  src={URL.createObjectURL(file)}
                  className="w-full h-full object-cover"
                  alt="Avatar preview"
                />
              ) : userName ? (
                <img
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userName)}`}
                  className="w-full h-full object-cover"
                  alt="Auto Avatar"
                />
              ) : (
                <FaUserCircle className="text-slate-300 dark:text-slate-600 w-9 h-9" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <label
                htmlFor="profile-file-input"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-palette-eden hover:bg-slate-50 dark:hover:bg-palette-sanmarino active:scale-95 border border-slate-200 dark:border-palette-sinbad/30 rounded-xl text-xs font-semibold cursor-pointer text-palette-eden dark:text-palette-janna transition shadow-2xs"
              >
                <FaRegImage className="text-palette-bondi dark:text-palette-sinbad" />
                {file ? "Cambiar foto" : "Subir imagen"}
              </label>
              <input
                type="file"
                id="profile-file-input"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1 truncate">
                {file ? file.name : "O te crearemos un bot único."}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleEnterChat}
          disabled={!userName.trim() || isUploading}
          className="w-full py-3.5 bg-palette-bondi hover:bg-palette-bondi-hover active:scale-[0.98] text-white font-semibold rounded-2xl transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-palette-bondi/25 mt-2 text-sm sm:text-base cursor-pointer tracking-wide flex items-center justify-center"
        >
          {isUploading ? "Cargando..." : "Entrar al Chat"}
        </button>

        <p className="text-[10.5px] text-center text-slate-400 dark:text-slate-500 pt-1.5 font-medium tracking-tight select-none">
          Desarrollado con ❤️ por <span className="text-palette-bondi dark:text-palette-sinbad font-semibold">Axel Quintana</span>
        </p>
      </div>
    </section>
  );
}






