# 💬 Realtime Comments & Chat App (Serverless)

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-State_Management-4338CA?style=for-the-badge)

Una aplicación de mensajería y comentarios en tiempo real moderna, rápida y **100% Serverless**, inspirada en la experiencia de chat de WhatsApp. Permite la comunicación instantánea entre múltiples usuarios mediante **WebSockets** gracias al motor de tiempo real de **Supabase** y **PostgreSQL**.

---

## 🚀 Características Principales

* ⚡ **Sincronización en Tiempo Real:** Suscripción directa a eventos `INSERT` en PostgreSQL a través de **Supabase Realtime**, permitiendo recibir mensajes al instante entre diferentes usuarios y dispositivos sin recargar.
* 👤 **Onboarding y Perfil de Usuario:** Creación de perfil interactivo con foto personalizada o generación automática de avatares únicos basados en el nombre.
* 💬 **Burbujas de Chat Estilo WhatsApp:** Diferenciación visual clara entre mensajes propios (derecha en tono índigo) y mensajes de otros participantes (izquierda en tono oscuro), con etiquetas de hora formateadas.
* 🖼️ **Soporte Multimedia:** Envío de imágenes y adjuntos en la conversación almacenados de forma segura en la nube (Supabase Storage / Cloudinary).
* 📜 **Auto-scroll Inteligente:** Desplazamiento automático fluido hacia el último mensaje recibido para mantener siempre el foco en la conversación activa.
* 📦 **Estado Global Persistente:** Gestión de estado reactiva y ultra ligera con **Zustand**, persistiendo la sesión del usuario en `localStorage`.
* 🛡️ **Seguridad RLS (Row Level Security):** Políticas de seguridad declarativas configuradas directamente en PostgreSQL para control granular de lectura e inserción.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend UI** | [React 18](https://react.dev/) | Librería principal para construcción de interfaces reactivas. |
| **Lenguaje** | [TypeScript](https://www.typescriptlang.org/) | Tipado estático y robustez en todo el flujo de datos. |
| **Bundler & Dev** | [Vite](https://vitejs.dev/) | Entorno de desarrollo ultrarrápido y empaquetado optimizado. |
| **Estilos** | [Tailwind CSS](https://tailwindcss.com/) | Diseño responsivo, tema oscuro nativo y componentes estilizados. |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) | Manejo de estado global con persistencia de usuario y mensajes. |
| **BaaS / Backend** | [Supabase](https://supabase.com/) | Base de datos PostgreSQL, canal Realtime WebSockets y Storage. |
| **Iconos** | [React Icons](https://react-icons.github.io/react-icons/) | Iconografía moderna e interactiva. |

---

## 📂 Estructura del Proyecto

```text
app-comments/
├── public/                 # Recursos estáticos
├── src/
│   ├── components/         # Componentes de la interfaz
│   │   ├── BodyComments.tsx # Lista de mensajes con scroll automático
│   │   ├── CardComment.tsx  # Burbuja de mensaje individual
│   │   ├── CommentInput.tsx # Barra de escritura, suscripción Realtime y envío
│   │   └── UserInput.tsx    # Pantalla de onboarding y selección de avatar
│   ├── services/           # Servicios e integraciones externas
│   │   ├── cloudinary.ts    # Servicio de fallback para imágenes
│   │   └── supabase.ts      # Consultas a la base de datos, Storage y Realtime
│   ├── store/              # Estado global con Zustand
│   │   └── preferences.ts   # Store de usuario y mensajes con persistencia
│   ├── types/              # Definiciones de tipos TypeScript
│   │   └── index.ts         # Interfaces de User, Comment y CommentRes
│   ├── App.tsx             # Componente raíz y control de flujo
│   ├── main.tsx            # Punto de entrada de la aplicación
│   ├── supabaseClient.ts   # Inicialización del cliente oficial de Supabase
│   └── index.css           # Directivas globales de Tailwind CSS
├── .env.example            # Plantilla de variables de entorno
├── index.html              # HTML base
├── package.json            # Dependencias y scripts del proyecto
├── tailwind.config.js      # Configuración de Tailwind CSS
├── tsconfig.json           # Configuración de TypeScript
└── vite.config.ts          # Configuración del bundler Vite
```

---

## ⚙️ Instalación y Puesta en Marcha

### 1. Clonar el repositorio e instalar dependencias
```bash
# Clonar el proyecto
git clone <URL_DEL_REPOSITORIO>

# Entrar al directorio
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

### 3. Configurar Supabase (Base de Datos & Realtime)
En el **SQL Editor** de tu panel de Supabase, ejecuta el siguiente script:

```sql
-- 1. Crear tabla de comentarios / mensajes
CREATE TABLE IF NOT EXISTS public.comments (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    "profileImg" TEXT NOT NULL,
    content TEXT,
    "bodyImg" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar seguridad por fila (RLS) y permitir operaciones públicas
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura publica de mensajes" ON public.comments
    FOR SELECT USING (true);

CREATE POLICY "Insercion publica de mensajes" ON public.comments
    FOR INSERT WITH CHECK (true);

-- 3. Habilitar la replicación en tiempo real (Realtime)
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
Abre tu navegador en `http://localhost:5173` (o el puerto indicado en tu terminal).

---

## 🧪 Cómo Probar la Sincronización en Tiempo Real

1. Abre la aplicación en una pestaña normal de tu navegador e ingresa con el usuario **"Axel"**.
2. Abre una ventana de **Incógnito** o un navegador diferente e ingresa con el usuario **"Invitado"**.
3. Envía un mensaje desde cualquier ventana: notarás cómo aparece **instantáneamente** en la otra pantalla sin parpadeos ni recargas.

---

## 👤 Autor

Desarrollado con dedicación por **Axel Quintana**  
*Desarrollador Full Stack & QA Automation*

[![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?style=flat-square&logo=github)](https://github.com/AxelQuintana)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/axel-quintana)

---
© 2026 Axel Quintana. Todos los derechos reservados.

