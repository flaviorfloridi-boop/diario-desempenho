import { useState, useCallback, Suspense, lazy } from "react";
import { carregarDados, salvarDados, carregarConfig, salvarConfig } from "./lib/storage";
import { todayISO } from "./lib/dates";
import { useNotificacoes } from "./hooks/useNotificacoes";
import * as googleCalendar from "./lib/googleCalendar";
import { TopBar } from "./components/TopBar";
import { NavTabs } from "./components/NavTabs";
import { HojeView } from "./components/HojeView";
import { AgendaView } from "./components/AgendaView";
import { RegistroView } from "./components/RegistroView";
import { AreasView } from "./components/AreasView";
import { HabitosView } from "./components/HabitosView";
import { DiarioView } from "./components/DiarioView";
import { MetasView } from "./components/MetasView";
import { TarefasKanbanView } from "./components/TarefasKanbanView";
import { ConfiguracoesView } from "./components/ConfiguracoesView";

const PainelView = lazy(() => import("./components/PainelView").then((m) => ({ default: m.PainelView })));

export default function App() {
  const [tab, setTab] = useState("hoje");
  const [dados, setDados] = useState(() => carregarDados());
  const [config, setConfig] = useState(() => carregarConfig());
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [saveError, setSaveError] = useState(false);
  const [googleConectado, setGoogleConectado] = useState(false);
  const [googleErro, setGoogleErro] = useState("");

  const { ativas: notifAtivas, ativar: ativarNotificacoes } = useNotificacoes(dados);

  const persist = useCallback((proximosDados) => {
    setDados(proximosDados);
    const ok = salvarDados(proximosDados);
    setSaveError(!ok);
  }, []);

  function recarregarDados() {
    setDados(carregarDados());
  }

  function salvarGoogleClientId(clientId) {
    const proximaConfig = { ...config, googleClientId: clientId };
    setConfig(proximaConfig);
    salvarConfig(proximaConfig);
  }

  async function conectarGoogle() {
    setGoogleErro("");
    try {
      await googleCalendar.conectar(config.googleClientId);
      setGoogleConectado(true);
    } catch (e) {
      setGoogleErro(e.message || "Não consegui conectar ao Google Calendar.");
      setGoogleConectado(false);
    }
  }

  function desconectarGoogle() {
    googleCalendar.desconectar();
    setGoogleConectado(false);
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <TopBar dados={dados} notifAtivas={notifAtivas} ativarNotificacoes={ativarNotificacoes} />
      <NavTabs tab={tab} setTab={setTab} />

      <main className="df-main">
        {saveError && (
          <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "#c0392b" }}>
            Não consegui salvar agora — o navegador pode estar sem espaço de armazenamento.
          </p>
        )}
        <div key={tab} className="df-tab-content">
          {tab === "hoje" && <HojeView dados={dados} persist={persist} />}
          {tab === "agenda" && (
            <AgendaView
              dados={dados}
              persist={persist}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              googleConectado={googleConectado}
              conectarGoogle={conectarGoogle}
            />
          )}
          {tab === "registro" && <RegistroView dados={dados} persist={persist} />}
          {tab === "areas" && <AreasView dados={dados} persist={persist} />}
          {tab === "tarefas" && <TarefasKanbanView dados={dados} persist={persist} />}
          {tab === "habitos" && <HabitosView dados={dados} persist={persist} />}
          {tab === "diario" && <DiarioView dados={dados} persist={persist} />}
          {tab === "metas" && <MetasView dados={dados} persist={persist} />}
          {tab === "painel" && (
            <Suspense fallback={<p style={{ fontSize: 13.5, color: "#5b6272" }}>Carregando painel…</p>}>
              <PainelView dados={dados} />
            </Suspense>
          )}
          {tab === "config" && (
            <ConfiguracoesView
              config={config}
              salvarGoogleClientId={salvarGoogleClientId}
              googleConectado={googleConectado}
              googleErro={googleErro}
              conectarGoogle={conectarGoogle}
              desconectarGoogle={desconectarGoogle}
              notifAtivas={notifAtivas}
              ativarNotificacoes={ativarNotificacoes}
              recarregarDados={recarregarDados}
            />
          )}
        </div>
      </main>
    </div>
  );
}
