// Gera arquivos .ics (iCalendar) — o formato padrão aberto que Apple Calendar,
// Outlook, Google Calendar e praticamente qualquer app de calendário sabe abrir.
// Diferente da integração via OAuth (só Google, por causa de CORS/backend),
// isso funciona universalmente e sem nenhuma configuração.

function pad(n) {
  return String(n).padStart(2, "0");
}

function paraICSDateTime(dataISO, horario) {
  const [h, m] = horario.split(":");
  return `${dataISO.replace(/-/g, "")}T${pad(h)}${pad(m)}00`;
}

function escaparTexto(texto) {
  return String(texto).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function gerarICS(task, dataISO) {
  const uid = `${task.id}@diario-desempenho`;
  const agora = new Date();
  const dtstamp = `${agora.getUTCFullYear()}${pad(agora.getUTCMonth() + 1)}${pad(agora.getUTCDate())}T${pad(agora.getUTCHours())}${pad(agora.getUTCMinutes())}${pad(agora.getUTCSeconds())}Z`;

  const linhas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Diario de Desempenho//PT-BR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${paraICSDateTime(dataISO, task.inicio)}`,
    `DTEND:${paraICSDateTime(dataISO, task.fim)}`,
    `SUMMARY:${escaparTexto(task.titulo)}`,
    "DESCRIPTION:Criado no Diario de Desempenho",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return linhas.join("\r\n");
}

export function baixarICS(task, dataISO) {
  const conteudo = gerarICS(task, dataISO);
  const blob = new Blob([conteudo], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${task.titulo.replace(/[^\w\s-]/g, "").slice(0, 40) || "evento"}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
