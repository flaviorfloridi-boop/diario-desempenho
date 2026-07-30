import { useState, useCallback, Suspense, lazy } from "react";
import { carregarDados, salvarDados, carregarConfig, salvarConfig } from "./lib/storage";
import { todayISO } from "./lib/dates";
import { useNotificacoes } from "./hooks/useNotificacoes";
import { TopBar } from "./components/TopBar";
import { NavTabs } from "./components/NavTabs";
import { HojeView } from "./components/HojeView";
import { AgendaView } from "./components/AgendaView";
import { RegistroView } from "./components/RegistroView";
import { AreasView } from "./components/AreasView";
import { ConfiguracoesView } from "./components/ConfiguracoesView";

const PainelView = lazy(() => import("./components/PainelView").then((m) => ({ default: m.PainelView })));

export default function App() {
  const [tab, setTab] = useState("hoje");
  const [dados, setDados] = useState(() => carregarDados());
  const [config, setConfig] = useState(() => carregarConfig());
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [saveError, setSaveError] = useState(false);

  const { ativas: notifAtivas, ativar: ativarNotificacoes } = useNotificacoes(dados);

  const persist = useCallback((proximosDados) => {
    setDados(proximosDados);
    const ok = salvarDados(proximosDados);
    setSaveError(!ok);
  }, []);

  function recarregarDados() {
    setDados(carregarDados());
  }

  function salvarApiKey(chave) {
    const proximaConfig = { ...config, anthropicApiKey: chave };
    setConfig(proximaConfig);
    salvarConfig(proximaConfig);
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
        {tab === "hoje" && <HojeView dados={dados} persist={persist} />}
        {tab === "agenda" && <AgendaView dados={dados} persist={persist} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />}
        {tab === "registro" && <RegistroView dados={dados} persist={persist} apiKey={config.anthropicApiKey} />}
        {tab === "areas" && <AreasView dados={dados} persist={persist} />}
        {tab === "painel" && (
          <Suspense fallback={<p style={{ fontSize: 13.5, color: "#5b6272" }}>Carregando painel…</p>}>
            <PainelView dados={dados} />
          </Suspense>
        )}
        {tab === "config" && (
          <ConfiguracoesView
            config={config}
            salvarApiKey={salvarApiKey}
            notifAtivas={notifAtivas}
            ativarNotificacoes={ativarNotificacoes}
            recarregarDados={recarregarDados}
          />
        )}
      </main>
    </div>
  );
}
