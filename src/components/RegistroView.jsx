import { useState } from "react";
import { Mic, Square, Sparkles, Loader2, ThumbsUp, Lightbulb } from "lucide-react";
import { todayISO, addDaysISO, fmtDataCurta, uid, REVIEW_INTERVALS } from "../lib/dates";
import { pedirFeedbackIA, ApiKeyAusenteError } from "../lib/ai";
import { useSpeechToText } from "../hooks/useSpeechToText";
import { GrowthRing } from "./GrowthRing";
import { EmptyState } from "./Shared";

export function RegistroView({ dados, persist, apiKey }) {
  const [areaId, setAreaId] = useState(dados.areas[0]?.id ?? "");
  const [texto, setTexto] = useState("");
  const [minutos, setMinutos] = useState(30);
  const [mastery, setMastery] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const { suportado, gravando, iniciar, parar } = useSpeechToText();

  const area = dados.areas.find((a) => a.id === areaId);
  const entradas = dados.entries.filter((e) => e.areaId === areaId).sort((a, b) => b.data.localeCompare(a.data));

  function toggleGravacao() {
    if (gravando) { parar(); return; }
    iniciar((t) => setTexto((prev) => (prev ? prev + " " : "") + t));
  }

  async function salvar() {
    if (!area || !texto.trim()) return;
    setCarregando(true);
    setErro("");
    let feedback = null;
    try {
      feedback = await pedirFeedbackIA({ apiKey, areaNome: area.nome, areaTipo: area.tipo, texto });
    } catch (e) {
      setErro(e instanceof ApiKeyAusenteError ? e.message : "Não consegui gerar o feedback agora, mas seu registro foi salvo.");
    }
    const hoje = todayISO();
    const reviewCount = Math.min((area.reviewCount ?? 0) + 1, REVIEW_INTERVALS.length - 1);
    const nextReview = addDaysISO(hoje, REVIEW_INTERVALS[reviewCount]);
    const entrada = { id: uid(), areaId, data: hoje, minutos, texto, mastery, feedback };
    persist({
      ...dados,
      entries: [...dados.entries, entrada],
      areas: dados.areas.map((a) => (a.id === areaId ? { ...a, mastery, reviewCount, lastActivity: hoje, nextReview } : a)),
    });
    setTexto("");
    setCarregando(false);
  }

  if (dados.areas.length === 0) {
    return <EmptyState texto="Cadastre uma área (matéria ou esporte) na aba Áreas antes de registrar algo." />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="df-card">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <select className="df-input" value={areaId} onChange={(e) => setAreaId(e.target.value)} style={{ width: 220, fontWeight: 700 }}>
            {dados.areas.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>
          <label style={{ fontSize: 12.5, color: "#5b6272", display: "flex", alignItems: "center", gap: 6 }}>
            Minutos <input className="df-input" type="number" min={5} step={5} value={minutos} onChange={(e) => setMinutos(Number(e.target.value))} style={{ width: 64 }} />
          </label>
          <label style={{ fontSize: 12.5, color: "#5b6272", display: "flex", alignItems: "center", gap: 6 }}>
            Nível agora
            <select className="df-input" value={mastery} onChange={(e) => setMastery(Number(e.target.value))} style={{ width: 70 }}>
              {[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}/5</option>)}
            </select>
          </label>
        </div>

        <div style={{ position: "relative" }}>
          <textarea
            className="df-input"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={`O que aconteceu ${area?.tipo === "esporte" ? "no treino" : "no estudo"}? Fale por voz ou digite aqui…`}
            style={{ width: "100%", minHeight: 110, resize: "vertical", paddingRight: 46 }}
          />
          {suportado && (
            <button className={`df-mic-btn ${gravando ? "gravando" : ""}`} onClick={toggleGravacao} title={gravando ? "Parar gravação" : "Falar"}>
              {gravando ? <Square size={13} /> : <Mic size={15} />}
            </button>
          )}
        </div>
        {!suportado && <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "#5b6272" }}>Seu navegador não suporta ditado por voz aqui — pode digitar normalmente.</p>}

        <button className="df-btn-primary" onClick={salvar} disabled={!texto.trim() || carregando} style={{ marginTop: 12 }}>
          {carregando ? <Loader2 size={15} className="df-spin" /> : <Sparkles size={15} />}
          {carregando ? "Analisando…" : "Salvar e pedir feedback da IA"}
        </button>
        {erro && <p style={{ margin: "8px 0 0", fontSize: 12, color: "#c0392b" }}>{erro}</p>}
      </div>

      <div>
        <p className="df-section-label">Histórico — {area?.nome}</p>
        {entradas.length === 0 && <EmptyState texto="Nenhum registro ainda pra essa área." />}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {entradas.map((e) => <EntradaCard key={e.id} entrada={e} />)}
        </div>
      </div>
    </div>
  );
}

function EntradaCard({ entrada }) {
  return (
    <div className="df-entrada">
      <div className="df-entrada-head">
        <span className="df-entrada-meta">{fmtDataCurta(entrada.data)} · {entrada.minutos} min</span>
        <GrowthRing level={entrada.mastery} size={22} />
      </div>
      <p className="df-entrada-texto">{entrada.texto}</p>
      {entrada.feedback && (
        <div className="df-feedback-grid">
          <div>
            <p className="df-feedback-titulo bom"><ThumbsUp size={12} /> BOM</p>
            <ul className="df-feedback-lista">{entrada.feedback.pontos_fortes?.map((p, i) => <li key={i}>{p}</li>)}</ul>
          </div>
          <div>
            <p className="df-feedback-titulo melhorar"><Lightbulb size={12} /> MELHORAR</p>
            <ul className="df-feedback-lista">{entrada.feedback.pontos_melhorar?.map((p, i) => <li key={i}>{p}</li>)}</ul>
          </div>
          {entrada.feedback.sugestao_proxima_sessao && <div className="df-sugestao">💡 {entrada.feedback.sugestao_proxima_sessao}</div>}
        </div>
      )}
    </div>
  );
}
