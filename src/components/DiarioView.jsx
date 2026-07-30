import { useState, useEffect } from "react";
import { Save, Moon, Droplets } from "lucide-react";
import { todayISO, fmtDataLonga, uid } from "../lib/dates";
import { EmptyState } from "./Shared";

const HUMORES = [
  { valor: 1, emoji: "😞", label: "Difícil" },
  { valor: 2, emoji: "😕", label: "Meh" },
  { valor: 3, emoji: "😐", label: "Ok" },
  { valor: 4, emoji: "🙂", label: "Bom" },
  { valor: 5, emoji: "😄", label: "Ótimo" },
];

export function DiarioView({ dados, persist }) {
  const hoje = todayISO();
  const entradaHoje = dados.journal.find((j) => j.data === hoje);

  const [humor, setHumor] = useState(entradaHoje?.humor ?? 3);
  const [texto, setTexto] = useState(entradaHoje?.texto ?? "");
  const [horasSono, setHorasSono] = useState(entradaHoje?.horasSono ?? "");
  const [coposAgua, setCoposAgua] = useState(entradaHoje?.coposAgua ?? "");
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    setHumor(entradaHoje?.humor ?? 3);
    setTexto(entradaHoje?.texto ?? "");
    setHorasSono(entradaHoje?.horasSono ?? "");
    setCoposAgua(entradaHoje?.coposAgua ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entradaHoje?.data]);

  function salvar() {
    const registro = { id: entradaHoje?.id ?? uid(), data: hoje, humor, texto, horasSono: horasSono === "" ? null : Number(horasSono), coposAgua: coposAgua === "" ? null : Number(coposAgua) };
    const outros = dados.journal.filter((j) => j.data !== hoje);
    persist({ ...dados, journal: [...outros, registro] });
    setSalvo(true);
    setTimeout(() => setSalvo(false), 1500);
  }

  const historico = dados.journal.filter((j) => j.data !== hoje).sort((a, b) => b.data.localeCompare(a.data)).slice(0, 14);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="df-card">
        <p style={{ margin: "0 0 2px", fontSize: 11.5, color: "#5b6272", textTransform: "capitalize" }}>Hoje</p>
        <h2 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 800 }}>{fmtDataLonga(hoje)}</h2>

        <p className="df-section-label">Como foi o dia?</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {HUMORES.map((h) => (
            <button
              key={h.valor}
              onClick={() => setHumor(h.valor)}
              title={h.label}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 22, cursor: "pointer",
                background: humor === h.valor ? "#e8edfd" : "#fff",
                border: humor === h.valor ? "2px solid #2b5cf0" : "1px solid #e1e5f0",
              }}
            >
              {h.emoji}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#5b6272" }}>
            <Moon size={14} /> Horas de sono
            <input className="df-input" type="number" min={0} max={14} step={0.5} value={horasSono} onChange={(e) => setHorasSono(e.target.value)} style={{ width: 60 }} />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#5b6272" }}>
            <Droplets size={14} /> Copos de água
            <input className="df-input" type="number" min={0} max={20} value={coposAgua} onChange={(e) => setCoposAgua(e.target.value)} style={{ width: 60 }} />
          </label>
        </div>

        <p className="df-section-label">Diário (privado, só seu)</p>
        <textarea
          className="df-input"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Como foi o dia? Alguma conquista, dificuldade, ou coisa que quer lembrar depois…"
          style={{ width: "100%", minHeight: 100, resize: "vertical" }}
        />

        <button className="df-btn-primary" onClick={salvar} style={{ marginTop: 12 }}>
          {salvo ? "Salvo ✓" : <><Save size={15} /> Salvar dia</>}
        </button>
      </div>

      <div>
        <p className="df-section-label">Últimos dias</p>
        {historico.length === 0 && <EmptyState texto="Seu histórico do diário aparece aqui conforme os dias passam." />}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {historico.map((j) => (
            <div key={j.id} className="df-entrada">
              <div className="df-entrada-head">
                <span className="df-entrada-meta">{fmtDataLonga(j.data)}</span>
                <span style={{ fontSize: 18 }}>{HUMORES.find((h) => h.valor === j.humor)?.emoji}</span>
              </div>
              {(j.horasSono != null || j.coposAgua != null) && (
                <p style={{ margin: "0 0 6px", fontSize: 11.5, color: "#5b6272", display: "flex", gap: 10 }}>
                  {j.horasSono != null && <span><Moon size={11} style={{ verticalAlign: -1 }} /> {j.horasSono}h</span>}
                  {j.coposAgua != null && <span><Droplets size={11} style={{ verticalAlign: -1 }} /> {j.coposAgua} copos</span>}
                </p>
              )}
              {j.texto && <p className="df-entrada-texto" style={{ marginBottom: 0 }}>{j.texto}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
