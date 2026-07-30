import { useMemo } from "react";
import { Flame, TrendingUp, Check, Bell, BellOff } from "lucide-react";
import { todayISO, addDaysISO } from "../lib/dates";

export function TopBar({ dados, notifAtivas, ativarNotificacoes }) {
  const hoje = todayISO();

  const streak = useMemo(() => {
    let count = 0;
    let d = hoje;
    const dias = new Set(dados.entries.map((e) => e.data));
    while (dias.has(d)) {
      count++;
      d = addDaysISO(d, -1);
    }
    return count;
  }, [dados.entries, hoje]);

  const minutosSemana = useMemo(() => {
    const dias = Array.from({ length: 7 }, (_, i) => addDaysISO(hoje, -i));
    return dados.entries.filter((e) => dias.includes(e.data)).reduce((s, e) => s + e.minutos, 0);
  }, [dados.entries, hoje]);

  const tarefasHoje = dados.tasks.filter((t) => t.data === hoje);
  const feitas = tarefasHoje.filter((t) => t.feita).length;

  return (
    <div className="df-topbar">
      <div className="df-topbar-inner">
        <div className="df-topbar-row">
          <div>
            <p className="df-eyebrow">Diário de desempenho</p>
            <h1 className="df-title">Acadêmico &amp; Esportes</h1>
          </div>
          <button className={`df-notif-btn ${notifAtivas ? "active" : ""}`} onClick={ativarNotificacoes}>
            {notifAtivas ? <Bell size={14} /> : <BellOff size={14} />}
            {notifAtivas ? "Lembretes ativos" : "Ativar lembretes"}
          </button>
        </div>

        <div className="df-placar-grid">
          <Placar icon={Flame} valor={streak} label={streak === 1 ? "dia seguido" : "dias seguidos"} />
          <Placar icon={TrendingUp} valor={`${Math.round((minutosSemana / 60) * 10) / 10}h`} label="essa semana" />
          <Placar icon={Check} valor={`${feitas}/${tarefasHoje.length}`} label="tarefas hoje" />
        </div>
      </div>
    </div>
  );
}

function Placar({ icon: Icon, valor, label }) {
  return (
    <div className="df-placar">
      <Icon size={14} color="#4d7bff" />
      <p className="df-placar-valor">{valor}</p>
      <p className="df-placar-label">{label}</p>
    </div>
  );
}
