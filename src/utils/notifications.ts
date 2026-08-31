// Utilidades de Sonido (Web Audio API) y Notificaciones Nativas del Navegador

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Sonido de mensaje entrante (Doble campana cristalina estilo iOS / Apple)
export function playIncomingMessageSound() {
  try {
    const ctx = getAudioContext();
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
    console.warn("Web Audio API no inicializada o bloqueada:", err);
  }
}

// 2. Sonido de mensaje saliente (Pop suave / "Swoosh")
export function playOutgoingMessageSound() {
  try {
    const ctx = getAudioContext();
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

// 3. Solicitar permiso de notificaciones del navegador
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    alert("Tu navegador no soporta notificaciones de escritorio.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

// 4. Mostrar notificación nativa en segundo plano
export function sendBrowserNotification(
  title: string,
  body: string,
  icon?: string,
  onClick?: () => void
) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
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
