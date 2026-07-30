import { Check, Circle, Sparkles } from "lucide-react";
import { todayISO } from "../lib/dates";
import { TipoBadge, EmptyState } from "./Shared";

export function HojeView({ dados, persist }) {
  const hoje = todayISO();
  const tarefas = dados.tasks.filter((t) => t.data === hoje).sort((a, b) => a.inicio.localeCompare(b.inicio));
  const paraRevisar = dados.areas.filter((a) => a.nextReview && a.nextReview <= hoje);
  const proxima = tarefas.find((t) => !t.feita);

  function toggleFeita(id) {
    persist({ ...dados, tasks: dados.tasks.map((t) => (t.id === id ? { ...t, feita: !t.feita } : t)) });
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
          <button className="df-hero-btn" onClick={() => toggleFeita(proxima.id)}>Marcar como feito</button>
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

      <div>
        <p className="df-section-label">Tarefas de hoje ({tarefas.length})</p>
        {tarefas.length === 0 && <EmptyState texto="Nada agendado pra hoje. Vá na aba Agenda pra planejar o dia." />}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {tarefas.map((t) => (
            <div key={t.id} className={`df-tarefa-row ${t.feita ? "feita" : ""}`}>
              <button className="df-icon-btn" onClick={() => toggleFeita(t.id)}>
                {t.feita ? <Check size={17} color="#2b5cf0" /> : <Circle size={17} color="#5b6272" />}
              </button>
              <span className="df-tarefa-hora">{t.inicio}</span>
              <span className={`df-tarefa-titulo ${t.feita ? "feita" : ""}`}>{t.titulo}</span>
              <TipoBadge tipo={t.tipo} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
