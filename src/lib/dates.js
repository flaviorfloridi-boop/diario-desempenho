export function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}
export function addDaysISO(iso, n) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
export function fmtDiaSemana(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "long" });
}
export function fmtDataLonga(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}
export function fmtDataCurta(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
export function googleCalendarLink(task, dataISO) {
  const [hi, mi] = task.inicio.split(":");
  const [hf, mf] = task.fim.split(":");
  const start = dataISO.replace(/-/g, "") + "T" + hi + mi + "00";
  const end = dataISO.replace(/-/g, "") + "T" + hf + mf + "00";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: task.titulo,
    dates: `${start}/${end}`,
    details: "Criado no Diário de Desempenho",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export const REVIEW_INTERVALS = [1, 3, 7, 16, 35, 90];
export const HORAS_DIA = Array.from({ length: 16 }, (_, i) => i + 6); // 06h-21h
export const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function diaDaSemana(iso) {
  return new Date(iso + "T00:00:00").getDay();
}
