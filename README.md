# 💬 Realtime iOS Chat & Messaging App (Serverless)

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-State_Management-4338CA?style=for-the-badge)

Una aplicación de mensajería instantánea en tiempo real moderna, elegante y **100% Serverless**, diseñada con el lenguaje visual de **Apple iOS (iMessage)** y una paleta cromática armónica de 5 tonos (Bondi Blue, San Marino, Eden, Sinbad y Janna). Permite la comunicación en tiempo real con WebSockets mediante **Supabase Realtime** y **PostgreSQL**.

---

## 🎨 Paleta de Diseño y Estética Visual

La interfaz está construida siguiendo las directrices de diseño de iOS (*Human Interface Guidelines*), incorporando superficies translúcidas (*Frosted Glass*), micro-interacciones suaves y una paleta de color personalizada:

| Color | Hex | Nombre | Rol en la Interfaz |
| :--- | :---: | :--- | :--- |
| ![#0799b6](https://via.placeholder.com/15/0799b6/000000?text=+) **Bondi Blue** | `#0799b6` | Principal / Acento | Botones de acción (Enviar, Ingresar), degradado de burbujas enviadas y badges. |
| ![#4a6eb0](https://via.placeholder.com/15/4a6eb0/000000?text=+) **San Marino** | `#4a6eb0` | Secundario / Acento | Degradados, bordes activos y estados hover. |
| ![#114c5f](https://via.placeholder.com/15/114c5f/000000?text=+) **Eden** | `#114c5f` | Tipografía / Oscuro | Textos de alto contraste en modo claro y superficies profundas en modo oscuro. |
| ![#9cd2d3](https://via.placeholder.com/15/9cd2d3/000000?text=+) **Sinbad** | `#9cd2d3` | Hielo / Celeste | Burbujas de mensajes recibidos, etiquetas de usuario e indicadores. |
| ![#f2e6cf](https://via.placeholder.com/15/f2e6cf/000000?text=+) **Janna** | `#f2e6cf` | Cálido / Acentos | Banners de anuncios oficiales del sistema y acentos visuales cálidos. |

---

## 🚀 Características Principales

* ⚡ **Sincronización en Tiempo Real:** Suscripción directa a eventos `INSERT` y `DELETE` en PostgreSQL a través de **Supabase Realtime WebSockets** sin necesidad de recargar la página.
* 🔔 **Sistema Integral de Notificaciones:**
  * 🔊 **Audio Cristalino iOS:** Doble campana sintetizada en tiempo real mediante **Web Audio API** para avisar de nuevos mensajes (con botón de silencio 🔔/🔕).
  * 🌐 **Notificaciones Web del Sistema:** Alertas nativas de escritorio si recibes un mensaje mientras la pestaña está minimizada o en segundo plano.
  * 📱 **Banners In-App Flotantes (iOS Dynamic Island):** Píldoras emergentes en la parte superior si te llega un mensaje en otro chat para saltar a él con 1 clic.
  * 🔴 **Contador en Pestaña:** Indicador dinámico `(1) 💬 Nuevo mensaje` en el título de la página mientras estás ausente.
* 🔒 **Conversaciones Privadas & Salas Protegidas:**
  * **Chats Directos (1 a 1 DMs):** Inicia chats privados exclusivos con cualquier usuario (ej: entre *Axel* y *Lucas*) con aislamiento de mensajes.
  * **Salas con Código / PIN:** Crea salas privadas protegidas para grupos cerrados.
  * **Selector de Conversaciones iOS:** Menú interactivo en el encabezado para alternar al instante entre **🌐 # General** y tus chats privados.
* 📱 **UI de Alta Precisión Estilo iOS (iMessage):**
  * Encabezado de navegación con efecto vidrio esmerilado (`backdrop-blur-xl`).
  * Selector de salas con avatares de participantes y botón de redactar nuevo chat.
  * Burbujas de chat con colas asimétricas iOS (`rounded-[20px] rounded-br-[4px]`).
  * Barra de entrada tipo píldora (*pill input*) con botón de adjuntos **`+`** y botón circular de envío.
  * Píldoras de estado y fecha (*"Hoy • #General"* y *"🔒 Chat Privado"*).


* 🌓 **Detección Automática de Tema (Auto Light / Dark Mode):**
  * Sincronización automática en vivo con la preferencia del sistema operativo (`prefers-color-scheme`).
  * Alternador manual de tema (📱 **Auto**, ☀️ **Claro**, 🌙 **Oscuro**) con un solo clic.
* 📜 **Barra de Scroll Ultra Fina y Redondeada (iOS Slim Scrollbar):**
  * Grosor minimalista de **5px** con bordes de píldora redondeados (`rounded-full`).
  * Translucidez adaptativa que cambia de color dinámicamente entre modo claro y oscuro.
* 👑 **Herramientas de Control para Administrador (`axeladmin`):**
  * **Insignia VIP:** Insignia dorada/celeste `🛡️ ADMIN` en el encabezado al ingresar como `axeladmin`.
  * **Panel de Control (iOS Action Sheet):** Métricas del chat en vivo (total de mensajes y participantes únicos).
  * **Difusión Global (Broadcast):** Envío de comunicados oficiales destacados del `SISTEMA`.
  * **Moderación Individual:** Botón discreto de eliminación por mensaje para borrar mensajes de prueba o inapropiados.
  * **Reset de Base de Datos:** Opción de purgar todos los mensajes de Supabase con ventana de confirmación.
* 🖼️ **Soporte Multimedia:** Envío de imágenes con previsualización en el chat, almacenadas en Supabase Storage (con fallback a Cloudinary).
* 👤 **Onboarding y Avatares Inteligentes:** Generación automática de avatares vía DiceBear Bottts o subida de foto de perfil personalizada.
* 📦 **Persistencia de Sesión:** Gestión de estado ultra rápida con **Zustand** y almacenamiento en `localStorage`.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Frontend Framework** | [React 18](https://react.dev/) | Componentes declarativos y reactividad. |
| **Tipado** | [TypeScript 5.6](https://www.typescriptlang.org/) | Tipado estático de extremo a extremo. |
| **Bundler & Build** | [Vite 5.4](https://vitejs.dev/) | HMR instantáneo y empaquetado optimizado para producción. |
| **Estilos & UI** | [Tailwind CSS 3.4](https://tailwindcss.com/) | Utilidades CSS, soporte nativo de modo oscuro y clases semánticas. |
| **Gestión de Estado** | [Zustand](https://zustand-demo.pmnd.rs/) | Store global con middleware de persistencia. |
| **Backend as a Service** | [Supabase](https://supabase.com/) | PostgreSQL, Realtime WebSockets, Storage y RLS. |
| **Iconografía** | [React Icons](https://react-icons.github.io/react-icons/) | Iconos vectoriales de Ionicons y VSCode. |

---

## 📂 Estructura del Proyecto

```text
app-comments/
├── public/
│   ├── favicon.svg          # Favicon vectorial personalizado iOS
│   └── vite.svg
├── src/
│   ├── components/          # Componentes de la interfaz
│   │   ├── BodyComments.tsx  # Canvas de mensajes con scroll fluido y fecha iOS
│   │   ├── CardComment.tsx   # Burbuja iMessage, comunicado oficial y moderación
│   │   ├── CommentInput.tsx  # Barra iMessage, Header translúcido y Action Sheet Admin
│   │   └── UserInput.tsx     # Tarjeta de onboarding iOS con firma de autor
│   ├── services/            # Capa de servicios y comunicación externa
│   │   ├── cloudinary.ts     # Fallback de subida de imágenes
│   │   └── supabase.ts       # Consultas, borrado, subida y difusión
│   ├── store/               # Estado global de la aplicación
│   │   └── preferences.ts    # Store Zustand con tema, usuario y mensajes
│   ├── types/               # Tipos e interfaces TypeScript
│   │   └── index.ts          # Definición de Comment, User y CommentRes
│   ├── App.tsx              # Componente principal con contenedor iOS y theme listener
│   ├── main.tsx             # Punto de montaje React DOM
│   ├── supabaseClient.ts    # Inicialización del SDK de Supabase
│   └── index.css            # Estilos globales y scrollbar ultra fino
├── .env.example             # Plantilla de variables de entorno
├── index.html               # Documento HTML con soporte iOS status bar
├── package.json             # Dependencias y scripts npm
├── tailwind.config.js       # Configuración de paleta y Dark Mode
├── tsconfig.json            # Configuración de compilador TypeScript
└── vite.config.ts           # Configuración del bundler Vite
```

---

## ⚙️ Guía de Instalación y Ejecución Local

### 1. Clonar el repositorio e instalar dependencias

```bash
# Clonar el proyecto
git clone <URL_DEL_REPOSITORIO>

# Ingresar al directorio
cd app-comments

# Instalar paquetes
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```env
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_KEY=TU_ANON_PUBLIC_KEY
```

### 3. Configurar la Base de Datos en Supabase

En el **SQL Editor** de tu consola de Supabase, ejecuta el siguiente script para crear la tabla, habilitar Realtime y configurar las políticas de seguridad (RLS):

```sql
-- 1. Crear tabla de mensajes (o actualizarla con la columna 'room')
CREATE TABLE IF NOT EXISTS public.comments (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    "profileImg" TEXT NOT NULL,
    content TEXT,
    "bodyImg" TEXT,
    room TEXT DEFAULT 'general',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Si ya tienes la tabla existente, agrega la columna y el índice:
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS room TEXT DEFAULT 'general';
CREATE INDEX IF NOT EXISTS idx_comments_room ON public.comments(room);

-- 2. Habilitar seguridad por fila (RLS)

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura publica de mensajes" ON public.comments
    FOR SELECT USING (true);

CREATE POLICY "Insercion publica de mensajes" ON public.comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir borrado publico de mensajes" ON public.comments
    FOR DELETE USING (true);

-- 3. Habilitar canal de tiempo real (Realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;

-- 4. Crear bucket público para almacenamiento de imágenes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Subida publica de imagenes" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'chat-images');

CREATE POLICY "Lectura publica de imagenes" ON storage.objects
    FOR SELECT USING (bucket_id = 'chat-images');
```

### 4. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

Abre tu navegador en `http://localhost:5173` (o el puerto mostrado en la consola).

---

## 🧪 Pruebas de Funcionamiento

1. **Sincronización en Tiempo Real:** Abre dos navegadores o ventanas (una en modo normal y otra en incógnito), ingresa con nombres diferentes y observa cómo los mensajes y fotos aparecen en milisegundos en ambas pantallas.
2. **Modo Administrador (`axeladmin`):** Ingresa con el usuario `axeladmin` para desbloquear el botón de **Admin**, consultar las estadísticas de la sala, enviar comunicados del sistema o moderar mensajes.
3. **Modo Oscuro / Claro:** Cambia el tema de tu sistema operativo o presiona el botón de Sol/Luna en el encabezado para ver la transición de colores y la barra de desplazamiento adaptativa.

---

## 👤 Autor

Desarrollado con ❤️ y dedicación por **Axel Quintana**  
*Desarrollador Full Stack & QA Automation*

[![GitHub](https://img.shields.io/badge/GitHub-AxelQuintana-181717?style=for-the-badge&logo=github)](https://github.com/AxelQuintana)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Axel_Quintana-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/axel-quintana)

---
© 2026 Axel Quintana. Todos los derechos reservados.
