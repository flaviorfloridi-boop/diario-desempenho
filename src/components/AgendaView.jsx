import { useState } from "react";
import { Plus, Trash2, Check, Circle, ChevronLeft, ChevronRight, CalendarPlus, Send, Loader2, CheckCheck, Download } from "lucide-react";
import { todayISO, addDaysISO, fmtDiaSemana, fmtDataLonga, uid, googleCalendarLink, HORAS_DIA } from "../lib/dates";
import { criarEvento } from "../lib/googleCalendar";
import { baixarICS } from "../lib/ics";
import { TipoBadge } from "./Shared";

export function AgendaView({ dados, persist, selectedDate, setSelectedDate, googleConectado, conectarGoogle }) {
  const [novo, setNovo] = useState({ inicio: "09:00", fim: "10:00", titulo: "", prioridade: "media", tipo: "academico" });
  const [enviando, setEnviando] = useState(null);
  const [enviados, setEnviados] = useState({});

  const tarefasDoDia = dados.tasks.filter((t) => t.data === selectedDate).sort((a, b) => a.inicio.localeCompare(b.inicio));
  const corPrioridade = { alta: "#c0392b", media: "#2b5cf0", baixa: "#5b6272" };

  function addTarefa() {
    if (!novo.titulo.trim()) return;
    const t = { id: uid(), data: selectedDate, ...novo, titulo: novo.titulo.trim(), feita: false };
    persist({ ...dados, tasks: [...dados.tasks, t] });
    setNovo({ ...novo, titulo: "" });
  }
  function toggleFeita(id) {
    persist({ ...dados, tasks: dados.tasks.map((t) => (t.id === id ? { ...t, feita: !t.feita } : t)) });
  }
  function remover(id) {
    persist({ ...dados, tasks: dados.tasks.filter((t) => t.id !== id) });
  }
  async function enviarProGoogle(t) {
    setEnviando(t.id);
    try {
      await criarEvento(t, selectedDate);
      setEnviados((prev) => ({ ...prev, [t.id]: true }));
    } catch {
      // silencioso — se falhar, a pessoa ainda tem o link manual como alternativa
    } finally {
      setEnviando(null);
    }
  }

  return (
    <div>
      <DateNav selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

      {!googleConectado && (
        <button className="df-btn-ghost" onClick={conectarGoogle} style={{ marginTop: 14 }}>
          <CalendarPlus size={14} /> Conectar ao Google Calendar
        </button>
      )}

      <div className="df-timeline" style={{ marginTop: 16 }}>
        {HORAS_DIA.map((h) => {
          const hh = String(h).padStart(2, "0") + ":00";
          const nesta = tarefasDoDia.filter((t) => t.inicio.slice(0, 2) === String(h).padStart(2, "0"));
          return (
            <div key={h} className="df-timeline-row">
              <div className="df-timeline-hora">{hh}</div>
              <div className="df-timeline-conteudo">
                {nesta.map((t) => (
                  <div key={t.id} className={`df-bloco ${t.feita ? "feita" : ""}`}>
                    <button className="df-icon-btn" onClick={() => toggleFeita(t.id)}>
                      {t.feita ? <Check size={15} color="#2b5cf0" /> : <Circle size={15} color="#5b6272" />}
                    </button>
                    <span className="df-tarefa-hora">{t.inicio}–{t.fim}</span>
                    <span className={`df-tarefa-titulo ${t.feita ? "feita" : ""}`} style={{ fontSize: 13.5 }}>{t.titulo}</span>
                    <TipoBadge tipo={t.tipo} />
                    <span style={{ width: 6, height: 6, borderRadius: 99, background: corPrioridade[t.prioridade], flexShrink: 0 }} />

                    {googleConectado ? (
                      <button className="df-icon-btn" onClick={() => enviarProGoogle(t)} disabled={enviando === t.id || enviados[t.id]} title="Enviar pro Google Calendar" style={{ color: enviados[t.id] ? "#1c7a4d" : "#5b6272", opacity: 0.75 }}>
                        {enviando === t.id ? <Loader2 size={13} className="df-spin" /> : enviados[t.id] ? <CheckCheck size={13} /> : <Send size={13} />}
                      </button>
                    ) : (
                      <a href={googleCalendarLink(t, selectedDate)} target="_blank" rel="noreferrer" title="Adicionar ao Google Calendar" style={{ display: "flex", color: "#5b6272", opacity: 0.6 }}>
                        <CalendarPlus size={13} />
                      </a>
                    )}
                    <button className="df-icon-btn" onClick={() => baixarICS(t, selectedDate)} title="Baixar .ics (Apple Calendar, Outlook, etc.)" style={{ opacity: 0.6 }}>
                      <Download size={13} />
                    </button>
                    <button className="df-icon-btn" onClick={() => remover(t.id)} style={{ opacity: 0.45 }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="df-card" style={{ marginTop: 18 }}>
        <p className="df-section-label">Novo bloco de tempo</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <input className="df-input" type="time" value={novo.inicio} onChange={(e) => setNovo({ ...novo, inicio: e.target.value })} style={{ width: 88 }} />
          <input className="df-input" type="time" value={novo.fim} onChange={(e) => setNovo({ ...novo, fim: e.target.value })} style={{ width: 88 }} />
          <input className="df-input" placeholder="O que vai fazer?" value={novo.titulo} onChange={(e) => setNovo({ ...novo, titulo: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addTarefa()} style={{ flex: 1, minWidth: 140 }} />
          <select className="df-input" value={novo.tipo} onChange={(e) => setNovo({ ...novo, tipo: e.target.value })} style={{ width: 130 }}>
            <option value="academico">Escola/TI</option>
            <option value="esporte">Treino</option>
            <option value="bemestar">Bem-estar</option>
            <option value="geral">Geral</option>
          </select>
          <select className="df-input" value={novo.prioridade} onChange={(e) => setNovo({ ...novo, prioridade: e.target.value })} style={{ width: 160 }}>
            <option value="alta">Urgente + importante</option>
            <option value="media">Importante</option>
            <option value="baixa">Se sobrar tempo</option>
          </select>
          <button onClick={addTarefa} className="df-btn-primary"><Plus size={15} /> Adicionar</button>
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 11.5, color: "#5b6272" }}>
          {googleConectado
            ? <>Clique no ícone <Send size={11} style={{ verticalAlign: -1 }} /> pra enviar direto pro Google Calendar, ou <Download size={11} style={{ verticalAlign: -1 }} /> pra baixar um arquivo .ics (funciona no Apple Calendar, Outlook e outros).</>
            : <>Clique em <CalendarPlus size={11} style={{ verticalAlign: -1 }} /> pra exportar pro Google com um clique, ou em <Download size={11} style={{ verticalAlign: -1 }} /> pra baixar um arquivo .ics — esse funciona no Apple Calendar (iPhone/Mac), Outlook, e praticamente qualquer app de calendário.</>}
        </p>
      </div>
    </div>
  );
}

function DateNav({ selectedDate, setSelectedDate }) {
  const isHoje = selectedDate === todayISO();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <p style={{ margin: 0, fontSize: 11.5, color: "#5b6272", textTransform: "capitalize" }}>{fmtDiaSemana(selectedDate)}</p>
        <h2 style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 800 }}>{fmtDataLonga(selectedDate)}</h2>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button className="df-nav-btn" onClick={() => setSelectedDate(addDaysISO(selectedDate, -1))}><ChevronLeft size={16} /></button>
        {!isHoje && <button className="df-nav-btn" style={{ width: "auto", padding: "0 12px", fontSize: 12.5, fontWeight: 700 }} onClick={() => setSelectedDate(todayISO())}>Hoje</button>}
        <button className="df-nav-btn" onClick={() => setSelectedDate(addDaysISO(selectedDate, 1))}><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}
