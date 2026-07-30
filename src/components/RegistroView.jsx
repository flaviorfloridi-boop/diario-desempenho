import { useState } from "react";
import { Mic, Square, ThumbsUp, Lightbulb, Target, Save } from "lucide-react";
import { todayISO, addDaysISO, fmtDataCurta, uid, REVIEW_INTERVALS } from "../lib/dates";
import { useSpeechToText } from "../hooks/useSpeechToText";
import { GrowthRing } from "./GrowthRing";
import { EmptyState } from "./Shared";

export function RegistroView({ dados, persist }) {
  const [areaId, setAreaId] = useState(dados.areas[0]?.id ?? "");
  const [texto, setTexto] = useState("");
  const [minutos, setMinutos] = useState(30);
  const [mastery, setMastery] = useState(0);
  const [bom, setBom] = useState("");
  const [melhorar, setMelhorar] = useState("");
  const [proximoPasso, setProximoPasso] = useState("");
  const { suportado, gravando, iniciar, parar } = useSpeechToText();

  const area = dados.areas.find((a) => a.id === areaId);
  const entradas = dados.entries.filter((e) => e.areaId === areaId).sort((a, b) => b.data.localeCompare(a.data));

  function toggleGravacao() {
    if (gravando) { parar(); return; }
    iniciar((t) => setTexto((prev) => (prev ? prev + " " : "") + t));
  }

  function salvar() {
    if (!area || !texto.trim()) return;
    const hoje = todayISO();
    const reviewCount = Math.min((area.reviewCount ?? 0) + 1, REVIEW_INTERVALS.length - 1);
    const nextReview = addDaysISO(hoje, REVIEW_INTERVALS[reviewCount]);
    const avaliacao = (bom.trim() || melhorar.trim() || proximoPasso.trim())
      ? { pontos_fortes: bom.trim() ? [bom.trim()] : [], pontos_melhorar: melhorar.trim() ? [melhorar.trim()] : [], sugestao_proxima_sessao: proximoPasso.trim() }
      : null;
    const entrada = { id: uid(), areaId, data: hoje, minutos, texto, mastery, feedback: avaliacao };
    persist({
      ...dados,
      entries: [...dados.entries, entrada],
      areas: dados.areas.map((a) => (a.id === areaId ? { ...a, mastery, reviewCount, lastActivity: hoje, nextReview } : a)),
    });
    setTexto(""); setBom(""); setMelhorar(""); setProximoPasso("");
  }

  if (dados.areas.length === 0) {
    return <EmptyState texto="Cadastre uma área (escola, treino, terapia…) na aba Áreas antes de registrar algo." />;
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

        <p className="df-section-label" style={{ marginBottom: 6 }}>O que rolou?</p>
        <div style={{ position: "relative" }}>
          <textarea
            className="df-input"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Fale por voz ou digite o que aconteceu…"
            style={{ width: "100%", minHeight: 90, resize: "vertical", paddingRight: 46 }}
          />
          {suportado && (
            <button className={`df-mic-btn ${gravando ? "gravando" : ""}`} onClick={toggleGravacao} title={gravando ? "Parar gravação" : "Falar"}>
              {gravando ? <Square size={13} /> : <Mic size={15} />}
            </button>
          )}
        </div>
        {!suportado && <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "#5b6272" }}>Seu navegador não suporta ditado por voz aqui — pode digitar normalmente.</p>}

        <p className="df-section-label" style={{ margin: "16px 0 6px" }}>Sua autoavaliação (opcional, mas ajuda muito)</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
            <ThumbsUp size={13} color="#1c7a4d" style={{ flexShrink: 0 }} />
            <input className="df-input" placeholder="O que foi bom hoje?" value={bom} onChange={(e) => setBom(e.target.value)} style={{ flex: 1 }} />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
            <Lightbulb size={13} color="#a8460f" style={{ flexShrink: 0 }} />
            <input className="df-input" placeholder="O que dá pra melhorar?" value={melhorar} onChange={(e) => setMelhorar(e.target.value)} style={{ flex: 1 }} />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
            <Target size={13} color="#2b5cf0" style={{ flexShrink: 0 }} />
            <input className="df-input" placeholder="Próximo passo pra próxima vez" value={proximoPasso} onChange={(e) => setProximoPasso(e.target.value)} style={{ flex: 1 }} />
          </label>
        </div>

        <button className="df-btn-primary" onClick={salvar} disabled={!texto.trim()} style={{ marginTop: 14 }}>
          <Save size={15} /> Salvar registro
        </button>
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
          {entrada.feedback.pontos_fortes?.length > 0 && (
            <div>
              <p className="df-feedback-titulo bom"><ThumbsUp size={12} /> BOM</p>
              <ul className="df-feedback-lista">{entrada.feedback.pontos_fortes.map((p, i) => <li key={i}>{p}</li>)}</ul>
            </div>
          )}
          {entrada.feedback.pontos_melhorar?.length > 0 && (
            <div>
              <p className="df-feedback-titulo melhorar"><Lightbulb size={12} /> MELHORAR</p>
              <ul className="df-feedback-lista">{entrada.feedback.pontos_melhorar.map((p, i) => <li key={i}>{p}</li>)}</ul>
            </div>
          )}
          {entrada.feedback.sugestao_proxima_sessao && <div className="df-sugestao">🎯 {entrada.feedback.sugestao_proxima_sessao}</div>}
        </div>
      )}
    </div>
  );
}
