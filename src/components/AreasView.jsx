import { useState } from "react";
import { Plus, Trash2, BookOpen, Dumbbell } from "lucide-react";
import { todayISO, fmtDataCurta, uid } from "../lib/dates";
import { GrowthRing } from "./GrowthRing";
import { EmptyState } from "./Shared";

export function AreasView({ dados, persist }) {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("academico");
  const [showForm, setShowForm] = useState(false);
  const hoje = todayISO();

  function addArea() {
    if (!nome.trim()) return;
    const a = { id: uid(), nome: nome.trim(), tipo, mastery: 0, reviewCount: 0, lastActivity: null, nextReview: hoje };
    persist({ ...dados, areas: [...dados.areas, a] });
    setNome("");
    setShowForm(false);
  }
  function remover(id) {
    persist({ ...dados, areas: dados.areas.filter((a) => a.id !== id), entries: dados.entries.filter((e) => e.areaId !== id) });
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Áreas</h2>
        <button className="df-btn-ghost" onClick={() => setShowForm((v) => !v)}><Plus size={15} /> Nova área</button>
      </div>

      {showForm && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <input autoFocus className="df-input" placeholder="Ex: Cálculo II, Natação, Violão…" value={nome} onChange={(e) => setNome(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addArea()} style={{ flex: 1, minWidth: 180 }} />
          <select className="df-input" value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ width: 140 }}>
            <option value="academico">Acadêmico</option>
            <option value="esporte">Esporte</option>
          </select>
          <button className="df-btn-primary" onClick={addArea}>Criar</button>
        </div>
      )}

      {dados.areas.length === 0 && <EmptyState texto="Nenhuma área cadastrada ainda." />}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {dados.areas.map((a) => {
          const total = dados.entries.filter((e) => e.areaId === a.id).length;
          const Icon = a.tipo === "esporte" ? Dumbbell : BookOpen;
          const cor = a.tipo === "esporte" ? "#0b0e14" : "#2b5cf0";
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
