import { Check, Circle, Sparkles, Flame, Target, Repeat } from "lucide-react";
import { todayISO, diaDaSemana } from "../lib/dates";
import { TipoBadge, EmptyState } from "./Shared";

export function HojeView({ dados, persist }) {
  const hoje = todayISO();
  const diaSemanaHoje = diaDaSemana(hoje);
  const tarefasUnicas = dados.tasks.filter((t) => !t.recorrente && t.data === hoje);
  const tarefasRecorrentes = dados.tasks.filter((t) => t.recorrente && t.recorrente.includes(diaSemanaHoje) && t.data <= hoje);
  const tarefas = [...tarefasUnicas, ...tarefasRecorrentes].sort((a, b) => a.inicio.localeCompare(b.inicio));

  function feitaNoDay(t) {
    return t.recorrente ? (t.feitasEm || []).includes(hoje) : t.feita;
  }

  const paraRevisar = dados.areas.filter((a) => a.nextReview && a.nextReview <= hoje);
  const proxima = tarefas.find((t) => !feitaNoDay(t));
  const habitosPendentes = dados.habits.filter((h) => !h.datas.includes(hoje));
  const metasAtivas = dados.goals.slice(0, 3);

  function toggleFeita(t) {
    if (t.recorrente) {
      const feitasEm = t.feitasEm || [];
      const proxima = feitasEm.includes(hoje) ? feitasEm.filter((d) => d !== hoje) : [...feitasEm, hoje];
      persist({ ...dados, tasks: dados.tasks.map((x) => (x.id === t.id ? { ...x, feitasEm: proxima } : x)) });
    } else {
      persist({ ...dados, tasks: dados.tasks.map((x) => (x.id === t.id ? { ...x, feita: !x.feita } : x)) });
    }
  }
  function toggleHabito(id) {
    persist({
      ...dados,
      habits: dados.habits.map((h) => {
        if (h.id !== id) return h;
        const tem = h.datas.includes(hoje);
        return { ...h, datas: tem ? h.datas.filter((d) => d !== hoje) : [...h.datas, hoje] };
      }),
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {proxima && (
        <div className="df-hero">
          <div>
            <p className="df-hero-label">A seguir</p>
            <p className="df-hero-title">{proxima.titulo}</p>
            <p className="df-hero-time">{proxima.inicio} – {proxima.fim}</p>
          </div>
          <button className="df-hero-btn" onClick={() => toggleFeita(proxima)}>Marcar como feito</button>
        </div>
      )}

      {paraRevisar.length > 0 && (
        <div className="df-revisar">
          <p className="df-revisar-label"><Sparkles size={14} /> Pra revisar hoje</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {paraRevisar.map((a) => <span key={a.id} className="df-pill">{a.nome}</span>)}
          </div>
        </div>
      )}

      {dados.habits.length > 0 && (
        <div>
          <p className="df-section-label">Hábitos de hoje</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {dados.habits.map((h) => {
              const feito = h.datas.includes(hoje);
              return (
                <button
                  key={h.id}
                  onClick={() => toggleHabito(h.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                    background: feito ? "var(--blue)" : "var(--white)", color: feito ? "var(--white)" : "var(--ink)", border: feito ? "none" : "1px solid var(--line)",
                  }}
                >
                  {feito ? <Check size={12} /> : <Flame size={12} color="var(--red)" />} {h.nome}
                </button>
              );
            })}
          </div>
          {habitosPendentes.length === 0 && <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--green)", fontWeight: 700 }}>✓ Todos os hábitos de hoje concluídos!</p>}
        </div>
      )}

      <div>
        <p className="df-section-label">Tarefas de hoje ({tarefas.length})</p>
        {tarefas.length === 0 && <EmptyState texto="Nada agendado pra hoje. Vá na aba Agenda pra planejar o dia." />}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {tarefas.map((t) => {
            const feita = feitaNoDay(t);
            return (
              <div key={t.id} className={`df-tarefa-row ${feita ? "feita" : ""}`}>
                <button className="df-icon-btn" onClick={() => toggleFeita(t)}>
                  {feita ? <Check size={17} color="var(--blue)" /> : <Circle size={17} color="var(--ink-soft)" />}
                </button>
                <span className="df-tarefa-hora">{t.inicio}</span>
                <span className={`df-tarefa-titulo ${feita ? "feita" : ""}`}>{t.titulo}</span>
                {t.recorrente && <Repeat size={12} color="var(--blue-bright)" />}
                <TipoBadge tipo={t.tipo} />
              </div>
            );
          })}
        </div>
      </div>

      {metasAtivas.length > 0 && (
        <div>
          <p className="df-section-label">Metas em andamento</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {metasAtivas.map((m) => {
              const total = m.checklist.length;
              const feitos = m.checklist.filter((i) => i.feito).length;
              const pct = total > 0 ? Math.round((feitos / total) * 100) : 0;
              return (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--white)", border: "1px solid var(--line)", borderRadius: 10, padding: "9px 12px" }}>
                  <Target size={14} color="var(--blue)" style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13 }}>{m.titulo}</span>
                  {total > 0 && <span style={{ fontSize: 11.5, color: "var(--ink-soft)", fontWeight: 700 }}>{pct}%</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
