import { useState, useRef } from "react";
import { Download, Upload, Check, ExternalLink } from "lucide-react";
import { exportarBackup, importarBackup } from "../lib/storage";

export function ConfiguracoesView({ config, salvarApiKey, notifAtivas, ativarNotificacoes, recarregarDados }) {
  const [chave, setChave] = useState(config.anthropicApiKey || "");
  const [salvo, setSalvo] = useState(false);
  const [importErro, setImportErro] = useState("");
  const fileRef = useRef(null);

  function salvar() {
    salvarApiKey(chave.trim());
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  }

  function onImportar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportErro("");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importarBackup(reader.result);
        recarregarDados();
      } catch {
        setImportErro("Não consegui ler esse arquivo — confirme que é um backup exportado daqui.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="df-card">
        <p className="df-config-label" style={{ marginBottom: 8 }}>Chave de API da Anthropic</p>
        <p className="df-config-help" style={{ marginBottom: 10 }}>
          Necessária pra gerar o feedback da IA na aba Registro. Pegue a sua em{" "}
          <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{ color: "#2b5cf0", fontWeight: 700 }}>
            console.anthropic.com <ExternalLink size={11} style={{ verticalAlign: -1 }} />
          </a>
          . Ela fica guardada só no seu navegador — nunca passa por nenhum outro servidor além do da própria Anthropic quando você usa o feedback.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            className="df-input"
            type="password"
            placeholder="sk-ant-…"
            value={chave}
            onChange={(e) => setChave(e.target.value)}
            style={{ flex: 1, minWidth: 220 }}
          />
          <button className="df-btn-primary" onClick={salvar}>
            {salvo ? <><Check size={15} /> Salvo</> : "Salvar chave"}
          </button>
        </div>
      </div>

      <div className="df-card">
        <p className="df-config-label" style={{ marginBottom: 8 }}>Lembretes</p>
        <p className="df-config-help" style={{ marginBottom: 10 }}>
          Notificações do navegador avisam sobre tarefas próximas enquanto esta aba estiver aberta. Pra receber
          mesmo com o app fechado, instale este site como aplicativo (ícone de instalar na barra de endereço) —
          isso ajuda, mas notificação 100% garantida com o app fechado exige um servidor próprio.
        </p>
        <button className={`df-notif-btn ${notifAtivas ? "active" : ""}`} style={{ color: notifAtivas ? "#fff" : "#0b0e14", borderColor: notifAtivas ? "#2b5cf0" : "#e1e5f0" }} onClick={ativarNotificacoes}>
          {notifAtivas ? "Lembretes ativos" : "Ativar lembretes"}
        </button>
      </div>

      <div className="df-card">
        <p className="df-config-label" style={{ marginBottom: 8 }}>Google Calendar</p>
        <p className="df-config-help">
          Cada tarefa da Agenda já exporta com um clique pro Google Calendar (sem precisar de login). Sincronização
          automática e de mão dupla exige conectar uma conta Google — se quiser esse nível, é um próximo passo que
          dá pra construir depois.
        </p>
      </div>

      <div className="df-card">
        <p className="df-config-label" style={{ marginBottom: 8 }}>Seus dados</p>
        <p className="df-config-help" style={{ marginBottom: 10 }}>
          Tudo fica salvo só neste navegador, neste dispositivo. Exporte um backup de vez em quando, e guarde num
          lugar seguro — se limpar os dados do navegador, o histórico se perde sem um backup.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="df-btn-ghost" onClick={exportarBackup}><Download size={14} /> Exportar backup</button>
          <button className="df-btn-ghost" onClick={() => fileRef.current?.click()}><Upload size={14} /> Importar backup</button>
          <input ref={fileRef} type="file" accept="application/json" onChange={onImportar} style={{ display: "none" }} />
        </div>
        {importErro && <p style={{ margin: "8px 0 0", fontSize: 12, color: "#c0392b" }}>{importErro}</p>}
      </div>
    </div>
  );
}
