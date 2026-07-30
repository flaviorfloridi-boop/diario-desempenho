import { useState } from "react";
import { Plus, Trash2, BookOpen, Dumbbell, HeartPulse } from "lucide-react";
import { todayISO, fmtDataCurta, uid } from "../lib/dates";
import { GrowthRing } from "./GrowthRing";
import { EmptyState } from "./Shared";

const CORES = { academico: "#2b5cf0", esporte: "#0b0e14", bemestar: "#0f6b47" };
const SUGESTOES = [
  { nome: "Escola", tipo: "academico" },
  { nome: "TI com o pai", tipo: "academico" },
  { nome: "Academia", tipo: "esporte" },
  { nome: "Jiu-jitsu", tipo: "esporte" },
  { nome: "Terapia", tipo: "bemestar" },
];

export function AreasView({ dados, persist }) {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("academico");
  const [showForm, setShowForm] = useState(false);
  const hoje = todayISO();

  function addArea(nomeParam, tipoParam) {
    const nomeFinal = (nomeParam ?? nome).trim();
    const tipoFinal = tipoParam ?? tipo;
    if (!nomeFinal) return;
    const a = { id: uid(), nome: nomeFinal, tipo: tipoFinal, mastery: 0, reviewCount: 0, lastActivity: null, nextReview: hoje };
    persist({ ...dados, areas: [...dados.areas, a] });
    setNome("");
    setShowForm(false);
  }
  function remover(id) {
    persist({ ...dados, areas: dados.areas.filter((a) => a.id !== id), entries: dados.entries.filter((e) => e.areaId !== id) });
  }

  const nomesExistentes = new Set(dados.areas.map((a) => a.nome.toLowerCase()));
  const sugestoesDisponiveis = SUGESTOES.filter((s) => !nomesExistentes.has(s.nome.toLowerCase()));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Áreas</h2>
        <button className="df-btn-ghost" onClick={() => setShowForm((v) => !v)}><Plus size={15} /> Nova área</button>
      </div>

      {showForm && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <input autoFocus className="df-input" placeholder="Ex: Matemática, Jiu-jitsu, Inglês…" value={nome} onChange={(e) => setNome(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addArea()} style={{ flex: 1, minWidth: 180 }} />
          <select className="df-input" value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ width: 150 }}>
            <option value="academico">Escola/TI</option>
            <option value="esporte">Treino</option>
            <option value="bemestar">Bem-estar</option>
          </select>
          <button className="df-btn-primary" onClick={() => addArea()}>Criar</button>
        </div>
      )}

      {dados.areas.length === 0 && sugestoesDisponiveis.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <p style={{ margin: "0 0 8px", fontSize: 12.5, color: "#5b6272" }}>Pra começar rápido, toque pra adicionar:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {sugestoesDisponiveis.map((s) => (
              <button key={s.nome} className="df-btn-ghost" onClick={() => addArea(s.nome, s.tipo)}>
                <Plus size={13} /> {s.nome}
              </button>
            ))}
          </div>
        </div>
      )}
      {dados.areas.length === 0 && <EmptyState texto="Nenhuma área cadastrada ainda." />}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {dados.areas.map((a) => {
          const total = dados.entries.filter((e) => e.areaId === a.id).length;
          const Icon = a.tipo === "esporte" ? Dumbbell : a.tipo === "bemestar" ? HeartPulse : BookOpen;
          const cor = CORES[a.tipo] || CORES.academico;
          return (
            <div key={a.id} className="df-area-row" style={{ borderLeft: `4px solid ${cor}` }}>
              <GrowthRing level={a.mastery} cor={cor} />
              <div style={{ flex: 1 }}>
                <p className="df-area-nome"><Icon size={14} />{a.nome}</p>
                <p className="df-area-meta">
                  {total} registro(s) · {a.lastActivity ? `última vez ${fmtDataCurta(a.lastActivity)}` : "ainda não iniciado"}
                  {a.nextReview && (a.nextReview <= hoje ? <span style={{ color: "#c0392b", fontWeight: 700 }}> · revisar hoje</span> : ` · próxima ${fmtDataCurta(a.nextReview)}`)}
                </p>
              </div>
              <button className="df-icon-btn" onClick={() => remover(a.id)} style={{ opacity: 0.4 }}><Trash2 size={15} /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
