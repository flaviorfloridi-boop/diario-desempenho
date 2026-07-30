import { useState } from "react";
import { Plus, Trash2, ChevronRight, ChevronLeft } from "lucide-react";
import { uid } from "../lib/dates";
import { EmptyState } from "./Shared";

const COLUNAS = [
  { id: "afazer", label: "A Fazer" },
  { id: "andamento", label: "Fazendo" },
  { id: "concluido", label: "Feito" },
];

export function TarefasKanbanView({ dados, persist }) {
  const [titulo, setTitulo] = useState("");

  function addTarefa() {
    if (!titulo.trim()) return;
    const t = { id: uid(), titulo: titulo.trim(), status: "afazer" };
    persist({ ...dados, kanban: [...dados.kanban, t] });
    setTitulo("");
  }
  function mover(id, novoStatus) {
    persist({ ...dados, kanban: dados.kanban.map((t) => (t.id === id ? { ...t, status: novoStatus } : t)) });
  }
  function remover(id) {
    persist({ ...dados, kanban: dados.kanban.filter((t) => t.id !== id) });
  }

  return (
    <div>
      <h2 style={{ margin: "0 0 14px", fontSize: 20, fontWeight: 800 }}>Tarefas</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input className="df-input" placeholder="Nova tarefa (ex: trabalho de história)" value={titulo} onChange={(e) => setTitulo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTarefa()} style={{ flex: 1 }} />
        <button className="df-btn-primary" onClick={addTarefa}><Plus size={15} /> Adicionar</button>
      </div>

      {dados.kanban.length === 0 && <EmptyState texto="Nenhuma tarefa por aqui — adicione a primeira acima." />}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {COLUNAS.map((col, idx) => {
          const tarefas = dados.kanban.filter((t) => t.status === col.id);
          return (
            <div key={col.id}>
              <p className="df-section-label">{col.label} ({tarefas.length})</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {tarefas.map((t) => (
                  <div key={t.id} className="df-card" style={{ padding: "10px 12px" }}>
                    <p style={{ margin: "0 0 8px", fontSize: 13.5 }}>{t.titulo}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        {idx > 0 && (
                          <button className="df-icon-btn" onClick={() => mover(t.id, COLUNAS[idx - 1].id)} title={`Voltar pra ${COLUNAS[idx - 1].label}`}>
                            <ChevronLeft size={14} />
                          </button>
                        )}
                        {idx < COLUNAS.length - 1 && (
                          <button className="df-icon-btn" onClick={() => mover(t.id, COLUNAS[idx + 1].id)} title={`Mover pra ${COLUNAS[idx + 1].label}`}>
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </div>
                      <button className="df-icon-btn" onClick={() => remover(t.id)} style={{ opacity: 0.4 }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
