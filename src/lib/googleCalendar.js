// Integração com o Google Calendar via Google Identity Services (OAuth no navegador,
// sem precisar de backend/servidor próprio). Requer um Client ID OAuth gratuito
// criado no Google Cloud Console pelo próprio usuário — não é uma chave paga.

const SCOPE = "https://www.googleapis.com/auth/calendar.events";

let tokenClient = null;
let accessToken = null;
let accessTokenExpiraEm = 0;

function scriptCarregado() {
  return typeof window !== "undefined" && window.google?.accounts?.oauth2;
}

export function googleDisponivel() {
  return scriptCarregado();
}

export function temTokenValido() {
  return Boolean(accessToken) && Date.now() < accessTokenExpiraEm;
}

export function conectar(clientId) {
  return new Promise((resolve, reject) => {
    if (!scriptCarregado()) {
      reject(new Error("O script do Google ainda não carregou. Recarregue a página e tente de novo."));
      return;
    }
    if (!clientId) {
      reject(new Error("Configure o Client ID do Google em Configurações antes de conectar."));
      return;
    }
    try {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPE,
        callback: (resp) => {
          if (resp.error) {
            reject(new Error(resp.error_description || resp.error));
            return;
          }
          accessToken = resp.access_token;
          accessTokenExpiraEm = Date.now() + (resp.expires_in - 60) * 1000;
          resolve(true);
        },
      });
      tokenClient.requestAccessToken({ prompt: temTokenValido() ? "" : "consent" });
    } catch (e) {
      reject(e);
    }
  });
}

export function desconectar() {
  if (accessToken && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(accessToken, () => {});
  }
  accessToken = null;
  accessTokenExpiraEm = 0;
}

async function chamarApi(path, options = {}) {
  if (!temTokenValido()) throw new Error("Não conectado ao Google Calendar.");
  const resp = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${accessToken}` },
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Erro do Google Calendar (${resp.status}): ${err.slice(0, 200)}`);
  }
  return resp.status === 204 ? null : resp.json();
}

export async function criarEvento(task, dataISO) {
  const evento = {
    summary: task.titulo,
    start: { dateTime: `${dataISO}T${task.inicio}:00`, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    end: { dateTime: `${dataISO}T${task.fim}:00`, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    description: "Criado no Diário de Desempenho",
  };
  return chamarApi("/calendars/primary/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(evento),
  });
}

export async function listarEventosDoDia(dataISO) {
  const inicio = `${dataISO}T00:00:00`;
  const fim = `${dataISO}T23:59:59`;
  const params = new URLSearchParams({
    timeMin: new Date(inicio).toISOString(),
    timeMax: new Date(fim).toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
  });
  const data = await chamarApi(`/calendars/primary/events?${params.toString()}`);
  return data.items || [];
}
