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
    <section className="bg-slate-950 w-full text-white min-h-[500px] border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-center my-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-400">Bienvenido al Chat</h2>
        <p className="text-slate-400 text-sm mt-1">Elige tu nombre y foto para comenzar</p>
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor="username" className="block text-xs font-semibold text-slate-400 mb-1">
            Nombre de usuario
          </label>
          <input
            id="username"
            type="text"
            placeholder="Ej. Axel, Alex, Satoshi..."
            className="bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 w-full text-slate-200 placeholder-slate-500 focus:outline-none transition"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleEnterChat();
            }}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">
            Foto de perfil (Opcional)
          </label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 border-2 border-dashed border-slate-700 bg-slate-900 rounded-full overflow-hidden flex items-center justify-center shrink-0">
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
                <FaUserCircle className="text-slate-600 w-12 h-12" />
              )}
            </div>

            <div className="flex-1">
              <label
                htmlFor="profile-file-input"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs cursor-pointer text-slate-300 transition"
              >
                <FaRegImage />
                {file ? "Cambiar imagen" : "Subir foto propia"}
              </label>
              <input
                type="file"
                id="profile-file-input"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <p className="text-[11px] text-slate-500 mt-1">
                {file ? file.name : "Si no subes una, te generaremos un bot automáticamente."}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleEnterChat}
          disabled={!userName.trim() || isUploading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30 mt-4"
        >
          {isUploading ? "Ingresando..." : "Ingresar al Chat"}
        </button>
      </div>
    </section>
  );
}

