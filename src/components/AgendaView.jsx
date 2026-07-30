import { useState } from "react";
import { Plus, Trash2, Check, Circle, ChevronLeft, ChevronRight, CalendarPlus, Send, Loader2, CheckCheck, Download, Clock, MoreHorizontal } from "lucide-react";
import { todayISO, addDaysISO, fmtDiaSemana, fmtDataLonga, uid, googleCalendarLink, HORAS_DIA } from "../lib/dates";
import { criarEvento } from "../lib/googleCalendar";
import { baixarICS } from "../lib/ics";
import { TipoBadge } from "./Shared";

const COR_TIPO = { academico: "#2b5cf0", esporte: "#0b0e14", bemestar: "#0f6b47", geral: "#5b6272" };
const COR_PRIORIDADE = { alta: "#c0392b", media: "#2b5cf0", baixa: "#94a0b4" };
const LABEL_PRIORIDADE = { alta: "Urgente + importante", media: "Importante", baixa: "Se sobrar tempo" };

export function AgendaView({ dados, persist, selectedDate, setSelectedDate, googleConectado, conectarGoogle }) {
  const [novo, setNovo] = useState({ inicio: "09:00", fim: "10:00", titulo: "", prioridade: "media", tipo: "academico" });
  const [enviando, setEnviando] = useState(null);
  const [enviados, setEnviados] = useState({});
  const [menuAberto, setMenuAberto] = useState(null);
  const [formAberto, setFormAberto] = useState(false);

  const tarefasDoDia = dados.tasks.filter((t) => t.data === selectedDate).sort((a, b) => a.inicio.localeCompare(b.inicio));
  const feitas = tarefasDoDia.filter((t) => t.feita).length;
  const isHoje = selectedDate === todayISO();
  const horaAtual = new Date().getHours();

  function addTarefa() {
    if (!novo.titulo.trim()) return;
    const t = { id: uid(), data: selectedDate, ...novo, titulo: novo.titulo.trim(), feita: false };
    persist({ ...dados, tasks: [...dados.tasks, t] });
    setNovo({ ...novo, titulo: "" });
    setFormAberto(false);
  }
  function toggleFeita(id) {
    persist({ ...dados, tasks: dados.tasks.map((t) => (t.id === id ? { ...t, feita: !t.feita } : t)) });
  }
  function remover(id) {
    persist({ ...dados, tasks: dados.tasks.filter((t) => t.id !== id) });
    setMenuAberto(null);
  }
  async function enviarProGoogle(t) {
    setEnviando(t.id);
    try {
      await criarEvento(t, selectedDate);
      setEnviados((prev) => ({ ...prev, [t.id]: true }));
    } catch {
      // silencioso — se falhar, a pessoa ainda tem as outras opções de exportar
    } finally {
      setEnviando(null);
    }
  }

  return (
    <div>
      <DateNav selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12.5, color: "#5b6272" }}>
            {tarefasDoDia.length === 0 ? "Nenhum bloco hoje" : `${feitas}/${tarefasDoDia.length} concluído${feitas === 1 ? "" : "s"}`}
          </span>
          {tarefasDoDia.length > 0 && (
            <div style={{ width: 60, height: 5, borderRadius: 3, background: "#e1e5f0", overflow: "hidden" }}>
              <div style={{ width: `${(feitas / tarefasDoDia.length) * 100}%`, height: "100%", background: "#2b5cf0", transition: "width 0.3s ease" }} />
            </div>
          )}
        </div>
        {!googleConectado && (
          <button className="df-btn-ghost" onClick={conectarGoogle} style={{ fontSize: 12 }}>
            <CalendarPlus size={13} /> Conectar Google Calendar
          </button>
        )}
      </div>

      <div className="df-timeline df-timeline-rica">
        {HORAS_DIA.map((h) => {
          const hh = String(h).padStart(2, "0") + ":00";
          const nesta = tarefasDoDia.filter((t) => t.inicio.slice(0, 2) === String(h).padStart(2, "0"));
          const ehAgora = isHoje && h === horaAtual;
          return (
            <div key={h} className={`df-timeline-row-rica ${nesta.length ? "com-bloco" : ""} ${ehAgora ? "agora" : ""}`}>
              <div className="df-timeline-hora-rica">
                {ehAgora && <span className="df-agora-dot" />}
                {hh}
              </div>
              <div className="df-timeline-conteudo">
                {nesta.map((t) => (
                  <div
                    key={t.id}
                    className={`df-bloco-rico ${t.feita ? "feita" : ""}`}
                    style={{ borderLeftColor: COR_TIPO[t.tipo] || COR_TIPO.geral }}
                  >
                    <button className="df-icon-btn" onClick={() => toggleFeita(t.id)} style={{ flexShrink: 0 }}>
                      {t.feita ? <Check size={17} color="#2b5cf0" /> : <Circle size={17} color="#c7ccd6" />}
                    </button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span className={`df-tarefa-titulo-rico ${t.feita ? "feita" : ""}`}>{t.titulo}</span>
                        <span className="df-prioridade-chip" style={{ color: COR_PRIORIDADE[t.prioridade] }}>
                          <span className="df-prioridade-dot" style={{ background: COR_PRIORIDADE[t.prioridade] }} />
                          {t.prioridade === "alta" ? "Urgente" : t.prioridade === "media" ? "Importante" : "Se sobrar"}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                        <span className="df-tarefa-hora-rica"><Clock size={11} style={{ verticalAlign: -1 }} /> {t.inicio}–{t.fim}</span>
                        <TipoBadge tipo={t.tipo} />
                      </div>
                    </div>

                    <div className="df-bloco-acoes" style={{ position: "relative" }}>
                      <button className="df-icon-btn" onClick={() => setMenuAberto(menuAberto === t.id ? null : t.id)} style={{ opacity: 0.55 }}>
                        <MoreHorizontal size={16} />
                      </button>
                      {menuAberto === t.id && (
                        <>
                          <div style={{ position: "fixed", inset: 0, zIndex: 19 }} onClick={() => setMenuAberto(null)} />
                          <div className="df-menu-flutuante">
                            {googleConectado ? (
                              <button className="df-menu-item" onClick={() => { enviarProGoogle(t); setMenuAberto(null); }} disabled={enviando === t.id}>
                                {enviando === t.id ? <Loader2 size={14} className="df-spin" /> : enviados[t.id] ? <CheckCheck size={14} color="#1c7a4d" /> : <Send size={14} />}
                                {enviados[t.id] ? "Enviado ao Google" : "Enviar ao Google Calendar"}
                              </button>
                            ) : (
                              <a className="df-menu-item" href={googleCalendarLink(t, selectedDate)} target="_blank" rel="noreferrer" onClick={() => setMenuAberto(null)}>
                                <CalendarPlus size={14} /> Adicionar ao Google Calendar
                              </a>
                            )}
                            <button className="df-menu-item" onClick={() => { baixarICS(t, selectedDate); setMenuAberto(null); }}>
                              <Download size={14} /> Baixar .ics (Apple/Outlook)
                            </button>
                            <button className="df-menu-item destrutivo" onClick={() => remover(t.id)}>
                              <Trash2 size={14} /> Remover
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {!formAberto ? (
        <button className="df-add-bloco-btn" onClick={() => setFormAberto(true)}>
          <Plus size={16} /> Novo bloco de tempo
        </button>
      ) : (
        <div className="df-card" style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p className="df-section-label" style={{ margin: 0 }}>Novo bloco de tempo</p>
            <button className="df-icon-btn" onClick={() => setFormAberto(false)} style={{ fontSize: 12, color: "#5b6272" }}>Cancelar</button>
          </div>

          <input
            className="df-input" autoFocus placeholder="O que vai fazer?"
            value={novo.titulo} onChange={(e) => setNovo({ ...novo, titulo: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && addTarefa()}
            style={{ width: "100%", marginBottom: 10, fontSize: 14.5, fontWeight: 600 }}
          />

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            <label className="df-mini-label">
              Início
              <input className="df-input" type="time" value={novo.inicio} onChange={(e) => setNovo({ ...novo, inicio: e.target.value })} style={{ width: 100 }} />
            </label>
            <label className="df-mini-label">
              Fim
              <input className="df-input" type="time" value={novo.fim} onChange={(e) => setNovo({ ...novo, fim: e.target.value })} style={{ width: 100 }} />
            </label>
            <label className="df-mini-label">
              Categoria
              <select className="df-input" value={novo.tipo} onChange={(e) => setNovo({ ...novo, tipo: e.target.value })} style={{ width: 130 }}>
                <option value="academico">Escola/TI</option>
                <option value="esporte">Treino</option>
                <option value="bemestar">Bem-estar</option>
                <option value="geral">Geral</option>
              </select>
            </label>
          </div>

          <div style={{ marginBottom: 14 }}>
            <p style={{ margin: "0 0 6px", fontSize: 11.5, color: "#5b6272", fontWeight: 700 }}>Prioridade</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {Object.entries(LABEL_PRIORIDADE).map(([valor, label]) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => setNovo({ ...novo, prioridade: valor })}
                  className="df-prioridade-opcao"
                  style={{
                    borderColor: novo.prioridade === valor ? COR_PRIORIDADE[valor] : "#e1e5f0",
                    background: novo.prioridade === valor ? `${COR_PRIORIDADE[valor]}14` : "#fff",
                    color: novo.prioridade === valor ? COR_PRIORIDADE[valor] : "#5b6272",
                  }}
                >
                  <span className="df-prioridade-dot" style={{ background: COR_PRIORIDADE[valor] }} /> {label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={addTarefa} className="df-btn-primary" style={{ width: "100%", justifyContent: "center" }}>
            <Plus size={15} /> Adicionar à agenda
          </button>
        </div>
      )}

      <p style={{ margin: "12px 0 0", fontSize: 11.5, color: "#5b6272", textAlign: "center" }}>
        Toque nos <MoreHorizontal size={12} style={{ verticalAlign: -2 }} /> de cada tarefa pra exportar pro Google Calendar ou baixar um .ics (Apple Calendar, Outlook…).
      </p>
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
