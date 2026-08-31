// Utilidades de Sonido (Web Audio API + HTML5 Audio Fallback), Vibración Háptica y Notificaciones Web

let audioCtx: AudioContext | null = null;
let isAudioUnlocked = false;

// Inicializador y desbloqueo de AudioContext para dispositivos móviles (iOS Safari & Android)
export function initAudioUnlock() {
  if (isAudioUnlocked) return;

  const unlock = () => {
    try {
      if (!audioCtx) {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
        }
      }
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      isAudioUnlocked = true;
    } catch (e) {
      console.warn("Audio unlock attempt:", e);
    }
  };

  window.addEventListener("touchstart", unlock, { once: true, passive: true });
  window.addEventListener("touchend", unlock, { once: true, passive: true });
  window.addEventListener("click", unlock, { once: true });
}

// Inicializar desbloqueo automáticamente al cargar el módulo
if (typeof window !== "undefined") {
  initAudioUnlock();
}

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (err) {
    console.warn("No se pudo obtener AudioContext:", err);
    return null;
  }
}

// 1. Vibración háptica para dispositivos móviles (Android / navegadores con soporte)
export function triggerHapticFeedback(pattern: number | number[] = [80, 50, 80]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch (err) {
    // Ignorar si el dispositivo no soporta vibración
  }
}

// 2. Sonido de mensaje entrante (Doble campana cristalina estilo iOS / Apple)
export function playIncomingMessageSound() {
  // Vibración háptica en móviles
  triggerHapticFeedback([100, 40, 100]);

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Primer tono (Nota C6 ~ 1046 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1046.5, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Segundo tono armónico más agudo (Nota E6 ~ 1318 Hz) a los 90ms
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1318.5, now + 0.09);
    gain2.gain.setValueAtTime(0.0001, now);
    gain2.gain.setValueAtTime(0.22, now + 0.09);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.09);
    osc2.stop(now + 0.48);
  } catch (err) {
    console.warn("Web Audio no disponible en este momento:", err);
  }
}

// 3. Sonido de mensaje saliente (Pop suave / "Swoosh")
export function playOutgoingMessageSound() {
  triggerHapticFeedback(40);

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  } catch (err) {
    console.warn("Error reproduciendo pop saliente:", err);
  }
}

// 4. Solicitar permiso de notificaciones del navegador con compatibilidad móvil
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  // Si el navegador no tiene la API Notification (ej. Safari en iOS sin PWA)
  if (!("Notification" in window)) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      alert(
        "📱 En iPhone (iOS Safari):\nPara activar notificaciones nativas en segundo plano, pulsa 'Compartir' 📤 y selecciona 'Agregar a Inicio' ➕.\n\nLos sonidos, vibraciones y avisos en pantalla ya están activos."
      );
    } else {
      alert("Este navegador móvil no soporta notificaciones de sistema. Los avisos visuales y sonoros en vivo están activos.");
    }
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (e) {
      console.warn("Error solicitando permisos de notificación:", e);
      return false;
    }
  }

  return false;
}

// 5. Mostrar notificación nativa en segundo plano
export function sendBrowserNotification(
  title: string,
  body: string,
  icon?: string,
  onClick?: () => void
) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted") {
    return;
  }

  try {
    const notification = new Notification(title, {
      body: body.length > 80 ? body.substring(0, 77) + "..." : body,
      icon: icon || "/favicon.svg",
      badge: "/favicon.svg",
      tag: "realtime-chat-msg",
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      if (onClick) onClick();
    };

    // Auto-cerrar después de 6 segundos
    setTimeout(() => {
      notification.close();
    }, 6000);
  } catch (err) {
    console.warn("Error mostrando notificación del navegador:", err);
  }
}

