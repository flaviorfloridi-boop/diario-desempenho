import { useState } from "react";
import { Plus, Trash2, Flame, Check } from "lucide-react";
import { todayISO, addDaysISO, uid } from "../lib/dates";
import { EmptyState } from "./Shared";

const SUGESTOES_HABITOS = ["Dormir cedo", "Beber água", "Ler", "Alongar", "Meditar"];

function calcularStreak(datas) {
  const set = new Set(datas);
  let count = 0;
  let d = todayISO();
  while (set.has(d)) {
    count++;
    d = addDaysISO(d, -1);
  }
  return count;
}

export function HabitosView({ dados, persist }) {
  const [nome, setNome] = useState("");
  const [showForm, setShowForm] = useState(false);
  const hoje = todayISO();

  function addHabito(nomeParam) {
    const nomeFinal = (nomeParam ?? nome).trim();
    if (!nomeFinal) return;
    const h = { id: uid(), nome: nomeFinal, datas: [] };
    persist({ ...dados, habits: [...dados.habits, h] });
    setNome("");
    setShowForm(false);
  }
  function toggleHoje(id) {
    persist({
      ...dados,
      habits: dados.habits.map((h) => {
        if (h.id !== id) return h;
        const tem = h.datas.includes(hoje);
        return { ...h, datas: tem ? h.datas.filter((d) => d !== hoje) : [...h.datas, hoje] };
      }),
    });
  }
  function remover(id) {
    persist({ ...dados, habits: dados.habits.filter((h) => h.id !== id) });
  }

  const nomesExistentes = new Set(dados.habits.map((h) => h.nome.toLowerCase()));
  const sugestoesDisponiveis = SUGESTOES_HABITOS.filter((s) => !nomesExistentes.has(s.toLowerCase()));

  const ultimos7 = Array.from({ length: 7 }, (_, i) => addDaysISO(hoje, -6 + i));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Hábitos</h2>
        <button className="df-btn-ghost" onClick={() => setShowForm((v) => !v)}><Plus size={15} /> Novo hábito</button>
      </div>

      {showForm && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input autoFocus className="df-input" placeholder="Ex: Beber 2L de água" value={nome} onChange={(e) => setNome(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addHabito()} style={{ flex: 1 }} />
          <button className="df-btn-primary" onClick={() => addHabito()}>Criar</button>
        </div>
      )}

      {dados.habits.length === 0 && sugestoesDisponiveis.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <p style={{ margin: "0 0 8px", fontSize: 12.5, color: "var(--ink-soft)" }}>Pra começar rápido, toque pra adicionar:</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {sugestoesDisponiveis.map((s) => (
              <button key={s} className="df-btn-ghost" onClick={() => addHabito(s)}><Plus size={13} /> {s}</button>
            ))}
          </div>
        </div>
      )}
      {dados.habits.length === 0 && <EmptyState texto="Nenhum hábito cadastrado ainda." />}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {dados.habits.map((h) => {
          const streak = calcularStreak(h.datas);
          const feitoHoje = h.datas.includes(hoje);
          return (
            <div key={h.id} className="df-card" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <button
                  onClick={() => toggleHoje(h.id)}
                  className="df-icon-btn"
                  style={{
                    width: 32, height: 32, borderRadius: 999, display: "grid", placeItems: "center",
                    background: feitoHoje ? "var(--blue)" : "var(--paper)", border: feitoHoje ? "none" : "1px solid var(--line)",
                  }}
                >
                  <Check size={16} color={feitoHoje ? "var(--white)" : "var(--ink-soft)"} />
                </button>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700 }}>{h.nome}</p>
                  <p style={{ margin: "1px 0 0", fontSize: 12, color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 4 }}>
                    {streak > 0 && <Flame size={12} color="var(--red)" />}
                    {streak === 0 ? "Sem sequência ainda" : `${streak} dia${streak > 1 ? "s" : ""} seguido${streak > 1 ? "s" : ""}`}
                  </p>
                </div>
                <button className="df-icon-btn" onClick={() => remover(h.id)} style={{ opacity: 0.4 }}><Trash2 size={15} /></button>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {ultimos7.map((d) => (
                  <div
                    key={d}
                    title={d}
                    style={{
                      flex: 1, height: 8, borderRadius: 4,
                      background: h.datas.includes(d) ? "var(--blue)" : "var(--line)",
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
