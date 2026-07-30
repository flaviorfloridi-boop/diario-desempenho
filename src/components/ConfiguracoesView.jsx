import { useState, useRef } from "react";
import { Download, Upload, Check, ExternalLink, Link2, Unlink } from "lucide-react";
import { exportarBackup, importarBackup } from "../lib/storage";

export function ConfiguracoesView({
  config, salvarGoogleClientId, googleConectado, googleErro, conectarGoogle, desconectarGoogle,
  notifAtivas, ativarNotificacoes, recarregarDados,
}) {
  const [clientId, setClientId] = useState(config.googleClientId || "");
  const [salvo, setSalvo] = useState(false);
  const [importErro, setImportErro] = useState("");
  const fileRef = useRef(null);

  function salvar() {
    salvarGoogleClientId(clientId.trim());
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
        <p className="df-config-label" style={{ marginBottom: 8 }}>Calendário</p>
        <p className="df-config-help" style={{ marginBottom: 10 }}>
          <strong>Usa iPhone/Mac com Apple Calendar?</strong> Na Agenda, clique no ícone de baixar (⬇) ao lado de
          qualquer tarefa — ele gera um arquivo <code>.ics</code> que abre direto no Calendário da Apple com um
          toque. Funciona também no Outlook e em qualquer outro app de calendário, sem precisar configurar nada.
        </p>
      </div>

      <div className="df-card">
        <p className="df-config-label" style={{ marginBottom: 8 }}>Google Calendar</p>
        <p className="df-config-help" style={{ marginBottom: 10 }}>
          Se preferir Google especificamente, dá pra conectar de verdade (enviar tarefas direto pro seu Google
          Calendar com um clique, sem baixar arquivo nenhum) usando um <strong>Client ID</strong> gratuito do
          Google Cloud. É diferente de uma chave de API paga — é só um identificador público, não tem custo nenhum.
        </p>
        <ol className="df-config-help" style={{ margin: "0 0 12px", paddingLeft: 18 }}>
          <li>Acesse <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" style={{ color: "#2b5cf0", fontWeight: 700 }}>console.cloud.google.com <ExternalLink size={10} style={{ verticalAlign: -1 }} /></a> e crie um projeto</li>
          <li>Vá em "APIs e Serviços" → ative a <strong>Google Calendar API</strong></li>
          <li>Em "Credenciais" → "Criar credenciais" → <strong>ID do cliente OAuth</strong> → tipo "Aplicativo da Web"</li>
          <li>Em "Origens JavaScript autorizadas", adicione o endereço deste site</li>
          <li>Copie o Client ID gerado e cole abaixo</li>
        </ol>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            className="df-input"
            placeholder="xxxxxxxxxx.apps.googleusercontent.com"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            style={{ flex: 1, minWidth: 220 }}
          />
          <button className="df-btn-primary" onClick={salvar}>
            {salvo ? <><Check size={15} /> Salvo</> : "Salvar Client ID"}
          </button>
        </div>

        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #e1e5f0", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {googleConectado ? (
            <>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#1c7a4d", display: "flex", alignItems: "center", gap: 5 }}><Link2 size={14} /> Conectado</span>
              <button className="df-btn-ghost" onClick={desconectarGoogle}><Unlink size={13} /> Desconectar</button>
            </>
          ) : (
            <button className="df-btn-ghost" onClick={conectarGoogle} disabled={!config.googleClientId}>
              <Link2 size={13} /> Conectar ao Google Calendar
            </button>
          )}
        </div>
        {googleErro && <p style={{ margin: "8px 0 0", fontSize: 12, color: "#c0392b" }}>{googleErro}</p>}
      </div>

      <div className="df-card">
        <p className="df-config-label" style={{ marginBottom: 8 }}>Lembretes</p>
        <p className="df-config-help" style={{ marginBottom: 10 }}>
          Notificações do navegador avisam sobre tarefas próximas enquanto o app está aberto. Instale como app
          (opção no navegador) pra ter uma experiência melhor no celular.
        </p>
        <button className={`df-notif-btn ${notifAtivas ? "active" : ""}`} style={{ color: notifAtivas ? "#fff" : "#0b0e14", borderColor: notifAtivas ? "#2b5cf0" : "#e1e5f0" }} onClick={ativarNotificacoes}>
          {notifAtivas ? "Lembretes ativos" : "Ativar lembretes"}
        </button>
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
