import { useState } from "react";
import { Plus, Trash2, Check, Circle, ChevronLeft, ChevronRight, CalendarPlus, Send, Loader2, CheckCheck, Download, Clock, MoreHorizontal, Repeat } from "lucide-react";
import { todayISO, addDaysISO, fmtDiaSemana, fmtDataLonga, uid, googleCalendarLink, HORAS_DIA, DIAS_SEMANA, diaDaSemana } from "../lib/dates";
import { criarEvento } from "../lib/googleCalendar";
import { baixarICS } from "../lib/ics";
import { TipoBadge } from "./Shared";

const COR_TIPO = { academico: "var(--blue)", esporte: "var(--steel)", bemestar: "var(--green)", geral: "var(--ink-soft)" };
const COR_PRIORIDADE = { alta: "var(--red)", media: "var(--blue)", baixa: "var(--ink-soft)" };
const LABEL_PRIORIDADE = { alta: "Urgente + importante", media: "Importante", baixa: "Se sobrar tempo" };

export function AgendaView({ dados, persist, selectedDate, setSelectedDate, googleConectado, conectarGoogle }) {
  const [novo, setNovo] = useState({ inicio: "09:00", fim: "10:00", titulo: "", prioridade: "media", tipo: "academico" });
  const [repetir, setRepetir] = useState(false);
  const [diasRepeticao, setDiasRepeticao] = useState([]);
  const [enviando, setEnviando] = useState(null);
  const [enviados, setEnviados] = useState({});
  const [menuAberto, setMenuAberto] = useState(null);
  const [formAberto, setFormAberto] = useState(false);

  const diaSemanaAtual = diaDaSemana(selectedDate);
  const tarefasUnicas = dados.tasks.filter((t) => !t.recorrente && t.data === selectedDate);
  const tarefasRecorrentes = dados.tasks.filter((t) => t.recorrente && t.recorrente.includes(diaSemanaAtual) && t.data <= selectedDate);
  const tarefasDoDia = [...tarefasUnicas, ...tarefasRecorrentes].sort((a, b) => a.inicio.localeCompare(b.inicio));

  function feitaNoDay(t) {
    return t.recorrente ? (t.feitasEm || []).includes(selectedDate) : t.feita;
  }

  const feitas = tarefasDoDia.filter(feitaNoDay).length;
  const isHoje = selectedDate === todayISO();
  const horaAtual = new Date().getHours();

  function addTarefa() {
    if (!novo.titulo.trim()) return;
    if (repetir && diasRepeticao.length === 0) return;
    const base = { id: uid(), data: selectedDate, ...novo, titulo: novo.titulo.trim() };
    const t = repetir ? { ...base, recorrente: diasRepeticao, feitasEm: [] } : { ...base, feita: false };
    persist({ ...dados, tasks: [...dados.tasks, t] });
    setNovo({ ...novo, titulo: "" });
    setRepetir(false);
    setDiasRepeticao([]);
    setFormAberto(false);
  }
  function toggleFeita(t) {
    if (t.recorrente) {
      const feitasEm = t.feitasEm || [];
      const proxima = feitasEm.includes(selectedDate) ? feitasEm.filter((d) => d !== selectedDate) : [...feitasEm, selectedDate];
      persist({ ...dados, tasks: dados.tasks.map((x) => (x.id === t.id ? { ...x, feitasEm: proxima } : x)) });
    } else {
      persist({ ...dados, tasks: dados.tasks.map((x) => (x.id === t.id ? { ...x, feita: !x.feita } : x)) });
    }
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
          <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
            {tarefasDoDia.length === 0 ? "Nenhum bloco hoje" : `${feitas}/${tarefasDoDia.length} concluído${feitas === 1 ? "" : "s"}`}
          </span>
          {tarefasDoDia.length > 0 && (
            <div style={{ width: 60, height: 5, borderRadius: 3, background: "var(--line)", overflow: "hidden" }}>
              <div style={{ width: `${(feitas / tarefasDoDia.length) * 100}%`, height: "100%", background: "var(--blue)", transition: "width 0.3s ease" }} />
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
                {nesta.map((t) => {
                  const feitaHoje = feitaNoDay(t);
                  return (
                  <div
                    key={t.id}
                    className={`df-bloco-rico ${feitaHoje ? "feita" : ""}`}
                    style={{ borderLeftColor: COR_TIPO[t.tipo] || COR_TIPO.geral }}
                  >
                    <button className="df-icon-btn" onClick={() => toggleFeita(t)} style={{ flexShrink: 0 }}>
                      {feitaHoje ? <Check size={17} color="var(--blue)" /> : <Circle size={17} color="var(--line)" />}
                    </button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span className={`df-tarefa-titulo-rico ${feitaHoje ? "feita" : ""}`}>{t.titulo}</span>
                        {t.recorrente && (
                          <span className="df-prioridade-chip" style={{ color: "var(--blue-bright)" }} title={`Repete: ${t.recorrente.map((d) => DIAS_SEMANA[d]).join(", ")}`}>
                            <Repeat size={11} />
                          </span>
                        )}
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

                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      <button className="df-menu-trigger" onClick={() => baixarICS(t, selectedDate)} title="Baixar .ics — abre no Apple Calendar, Outlook, etc.">
                        <Download size={16} />
                      </button>
                      <div className="df-bloco-acoes" style={{ position: "relative" }}>
                        <button className="df-menu-trigger" onClick={() => setMenuAberto(menuAberto === t.id ? null : t.id)}>
                          <MoreHorizontal size={18} />
                        </button>
                        {menuAberto === t.id && (
                          <>
                            <div style={{ position: "fixed", inset: 0, zIndex: 19 }} onClick={() => setMenuAberto(null)} />
                            <div className="df-menu-flutuante">
                              {googleConectado ? (
                                <button className="df-menu-item" onClick={() => { enviarProGoogle(t); setMenuAberto(null); }} disabled={enviando === t.id}>
                                  {enviando === t.id ? <Loader2 size={14} className="df-spin" /> : enviados[t.id] ? <CheckCheck size={14} color="var(--green)" /> : <Send size={14} />}
                                  {enviados[t.id] ? "Enviado ao Google" : "Enviar ao Google Calendar"}
                                </button>
                              ) : (
                                <a className="df-menu-item" href={googleCalendarLink(t, selectedDate)} target="_blank" rel="noreferrer" onClick={() => setMenuAberto(null)}>
                                  <CalendarPlus size={14} /> Adicionar ao Google Calendar
                                </a>
                              )}
                              <button className="df-menu-item destrutivo" onClick={() => remover(t.id)}>
                                <Trash2 size={14} /> {t.recorrente ? "Remover série" : "Remover"}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  );
                })}
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
            <button className="df-icon-btn" onClick={() => setFormAberto(false)} style={{ fontSize: 12, color: "var(--ink-soft)" }}>Cancelar</button>
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
            <p style={{ margin: "0 0 6px", fontSize: 11.5, color: "var(--ink-soft)", fontWeight: 700 }}>Prioridade</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {Object.entries(LABEL_PRIORIDADE).map(([valor, label]) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => setNovo({ ...novo, prioridade: valor })}
                  className="df-prioridade-opcao"
                  style={{
                    borderColor: novo.prioridade === valor ? COR_PRIORIDADE[valor] : "var(--line)",
                    background: novo.prioridade === valor ? "var(--blue-pale)" : "var(--white)",
                    color: novo.prioridade === valor ? COR_PRIORIDADE[valor] : "var(--ink-soft)",
                  }}
                >
                  <span className="df-prioridade-dot" style={{ background: COR_PRIORIDADE[valor] }} /> {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 700, cursor: "pointer", marginBottom: repetir ? 8 : 0 }}>
              <input type="checkbox" checked={repetir} onChange={(e) => { setRepetir(e.target.checked); if (e.target.checked && diasRepeticao.length === 0) setDiasRepeticao([diaDaSemana(selectedDate)]); }} />
              <Repeat size={13} color="var(--blue-bright)" /> Repetir toda semana
            </label>
            {repetir && (
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {DIAS_SEMANA.map((label, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setDiasRepeticao((prev) => (prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx]))}
                    style={{
                      width: 36, height: 36, borderRadius: 999, fontSize: 11.5, fontWeight: 700, cursor: "pointer",
                      border: diasRepeticao.includes(idx) ? "1.5px solid var(--blue)" : "1.5px solid var(--line)",
                      background: diasRepeticao.includes(idx) ? "var(--blue-pale)" : "var(--white)",
                      color: diasRepeticao.includes(idx) ? "var(--blue-bright)" : "var(--ink-soft)",
                    }}
                  >
                    {label[0]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={addTarefa} className="df-btn-primary" style={{ width: "100%", justifyContent: "center" }}>
            <Plus size={15} /> Adicionar à agenda
          </button>
        </div>
      )}

      <p style={{ margin: "12px 0 0", fontSize: 11.5, color: "var(--ink-soft)", textAlign: "center" }}>
        O ícone <Download size={12} style={{ verticalAlign: -2 }} /> baixa um .ics (abre no Apple Calendar, Outlook…). O <MoreHorizontal size={12} style={{ verticalAlign: -2 }} /> tem mais opções (Google Calendar, remover). O <Repeat size={12} style={{ verticalAlign: -2 }} /> mostra tarefas que se repetem toda semana.
      </p>
    </div>
  );
}

function DateNav({ selectedDate, setSelectedDate }) {
  const isHoje = selectedDate === todayISO();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <p style={{ margin: 0, fontSize: 11.5, color: "var(--ink-soft)", textTransform: "capitalize" }}>{fmtDiaSemana(selectedDate)}</p>
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
