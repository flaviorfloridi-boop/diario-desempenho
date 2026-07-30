import { useState } from "react";
import { Plus, Trash2, Target, Check, Circle } from "lucide-react";
import { fmtDataCurta, uid } from "../lib/dates";
import { EmptyState } from "./Shared";

const PRAZOS = { curto: "Curto prazo", medio: "Médio prazo", longo: "Longo prazo" };

export function MetasView({ dados, persist }) {
  const [titulo, setTitulo] = useState("");
  const [prazo, setPrazo] = useState("curto");
  const [showForm, setShowForm] = useState(false);
  const [novoItem, setNovoItem] = useState({});

  function addMeta() {
    if (!titulo.trim()) return;
    const g = { id: uid(), titulo: titulo.trim(), prazo, checklist: [], createdAt: new Date().toISOString().slice(0, 10) };
    persist({ ...dados, goals: [...dados.goals, g] });
    setTitulo("");
    setShowForm(false);
  }
  function remover(id) {
    persist({ ...dados, goals: dados.goals.filter((g) => g.id !== id) });
  }
  function addItemChecklist(goalId) {
    const texto = (novoItem[goalId] || "").trim();
    if (!texto) return;
    persist({
      ...dados,
      goals: dados.goals.map((g) => (g.id === goalId ? { ...g, checklist: [...g.checklist, { id: uid(), texto, feito: false }] } : g)),
    });
    setNovoItem({ ...novoItem, [goalId]: "" });
  }
  function toggleItem(goalId, itemId) {
    persist({
      ...dados,
      goals: dados.goals.map((g) =>
        g.id !== goalId ? g : { ...g, checklist: g.checklist.map((i) => (i.id === itemId ? { ...i, feito: !i.feito } : i)) }
      ),
    });
  }
  function removerItem(goalId, itemId) {
    persist({ ...dados, goals: dados.goals.map((g) => (g.id !== goalId ? g : { ...g, checklist: g.checklist.filter((i) => i.id !== itemId) })) });
  }

  const grupos = ["curto", "medio", "longo"];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Metas</h2>
        <button className="df-btn-ghost" onClick={() => setShowForm((v) => !v)}><Plus size={15} /> Nova meta</button>
      </div>

      {showForm && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <input autoFocus className="df-input" placeholder="Ex: Tirar faixa azul no jiu-jitsu" value={titulo} onChange={(e) => setTitulo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addMeta()} style={{ flex: 1, minWidth: 200 }} />
          <select className="df-input" value={prazo} onChange={(e) => setPrazo(e.target.value)} style={{ width: 150 }}>
            <option value="curto">Curto prazo</option>
            <option value="medio">Médio prazo</option>
            <option value="longo">Longo prazo</option>
          </select>
          <button className="df-btn-primary" onClick={addMeta}>Criar</button>
        </div>
      )}

      {dados.goals.length === 0 && <EmptyState texto="Nenhuma meta cadastrada ainda." />}

      {grupos.map((g) => {
        const metasDoGrupo = dados.goals.filter((m) => m.prazo === g);
        if (metasDoGrupo.length === 0) return null;
        return (
          <div key={g} style={{ marginBottom: 24 }}>
            <p className="df-section-label">{PRAZOS[g]} ({metasDoGrupo.length})</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {metasDoGrupo.map((meta) => {
                const total = meta.checklist.length;
                const feitos = meta.checklist.filter((i) => i.feito).length;
                const pct = total > 0 ? Math.round((feitos / total) * 100) : 0;
                return (
                  <div key={meta.id} className="df-card">
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <Target size={16} color="#2b5cf0" style={{ flexShrink: 0 }} />
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 800, flex: 1 }}>{meta.titulo}</p>
                      <button className="df-icon-btn" onClick={() => remover(meta.id)} style={{ opacity: 0.4 }}><Trash2 size={15} /></button>
                    </div>
                    {total > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ width: "100%", height: 6, borderRadius: 3, background: "#e1e5f0", overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: "#2b5cf0" }} />
                        </div>
                        <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "#5b6272" }}>{feitos}/{total} concluído(s) · {pct}%</p>
                      </div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
                      {meta.checklist.map((item) => (
                        <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <button className="df-icon-btn" onClick={() => toggleItem(meta.id, item.id)}>
                            {item.feito ? <Check size={14} color="#2b5cf0" /> : <Circle size={14} color="#5b6272" />}
                          </button>
                          <span style={{ flex: 1, fontSize: 13, textDecoration: item.feito ? "line-through" : "none", opacity: item.feito ? 0.6 : 1 }}>{item.texto}</span>
                          <button className="df-icon-btn" onClick={() => removerItem(meta.id, item.id)} style={{ opacity: 0.35 }}><Trash2 size={12} /></button>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <input
                        className="df-input"
                        placeholder="Adicionar passo…"
                        value={novoItem[meta.id] || ""}
                        onChange={(e) => setNovoItem({ ...novoItem, [meta.id]: e.target.value })}
                        onKeyDown={(e) => e.key === "Enter" && addItemChecklist(meta.id)}
                        style={{ flex: 1, fontSize: 12.5 }}
                      />
                      <button className="df-btn-ghost" onClick={() => addItemChecklist(meta.id)}>+</button>
                    </div>
                    <p style={{ margin: "8px 0 0", fontSize: 11, color: "#5b6272" }}>Criada em {fmtDataCurta(meta.createdAt)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
