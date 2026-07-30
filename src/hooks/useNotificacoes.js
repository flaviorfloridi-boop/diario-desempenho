import { useState, useEffect, useRef } from "react";
import { todayISO } from "../lib/dates";

export function useNotificacoes(dados) {
  const [ativas, setAtivas] = useState(() => typeof Notification !== "undefined" && Notification.permission === "granted");
  const notificadosRef = useRef(new Set());

  async function ativar() {
    if (typeof Notification === "undefined") return;
    const perm = await Notification.requestPermission();
    setAtivas(perm === "granted");
  }

  useEffect(() => {
    if (!ativas || !dados) return;
    const timer = setInterval(() => {
      const agora = new Date();
      const hoje = todayISO();
      dados.tasks
        .filter((t) => t.data === hoje && !t.feita)
        .forEach((t) => {
          const [h, m] = t.inicio.split(":").map(Number);
          const alvo = new Date();
          alvo.setHours(h, m, 0, 0);
          const diffMin = (alvo - agora) / 60000;
          if (diffMin <= 10 && diffMin > 8.5 && !notificadosRef.current.has(t.id)) {
            notificadosRef.current.add(t.id);
            if (Notification.permission === "granted") {
              new Notification("Daqui a pouco: " + t.titulo, { body: `Às ${t.inicio}` });
            }
          }
        });
    }, 30000);
    return () => clearInterval(timer);
  }, [ativas, dados]);

  return { ativas, ativar };
}
