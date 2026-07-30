import { useState, useRef } from "react";

export function useSpeechToText() {
  const [gravando, setGravando] = useState(false);
  const [suportado] = useState(
    () => typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  const recRef = useRef(null);

  function iniciar(onResultado) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "pt-BR";
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      let texto = "";
      for (let i = e.resultIndex; i < e.results.length; i++) texto += e.results[i][0].transcript;
      onResultado(texto);
    };
    rec.onend = () => setGravando(false);
    rec.onerror = () => setGravando(false);
    recRef.current = rec;
    rec.start();
    setGravando(true);
  }

  function parar() {
    recRef.current?.stop();
    setGravando(false);
  }

  return { suportado, gravando, iniciar, parar };
}
