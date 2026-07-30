import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend, LineChart, Line } from "recharts";
import { Flame } from "lucide-react";
import { todayISO, addDaysISO } from "../lib/dates";
import { GrowthRing } from "./GrowthRing";
import { EmptyState } from "./Shared";

const HUMOR_EMOJI = { 1: "😞", 2: "😕", 3: "😐", 4: "🙂", 5: "😄" };

function calcularStreak(datas, hoje) {
  const set = new Set(datas);
  let count = 0;
  let d = hoje;
  while (set.has(d)) { count++; d = addDaysISO(d, -1); }
  return count;
}

export function PainelView({ dados }) {
  const hoje = todayISO();
  const ultimos7 = useMemo(() => {
    const dias = Array.from({ length: 7 }, (_, i) => addDaysISO(hoje, -6 + i));
    const areaMap = Object.fromEntries(dados.areas.map((a) => [a.id, a.tipo]));
    return dias.map((d) => {
      const doDia = dados.entries.filter((e) => e.data === d);
      const academico = doDia.filter((e) => areaMap[e.areaId] === "academico").reduce((s, e) => s + e.minutos, 0);
      const esporte = doDia.filter((e) => areaMap[e.areaId] === "esporte").reduce((s, e) => s + e.minutos, 0);
      const bemestar = doDia.filter((e) => areaMap[e.areaId] === "bemestar").reduce((s, e) => s + e.minutos, 0);
      return { dia: new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""), academico, esporte, bemestar };
    });
  }, [dados.entries, dados.areas, hoje]);

  const humorSemana = useMemo(() => {
    const dias = Array.from({ length: 7 }, (_, i) => addDaysISO(hoje, -6 + i));
    return dias.map((d) => {
      const j = dados.journal.find((x) => x.data === d);
      return { dia: new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""), humor: j?.humor ?? null };
    });
  }, [dados.journal, hoje]);
  const temHumor = humorSemana.some((h) => h.humor != null);

  const habitosOrdenados = [...dados.habits].map((h) => ({ ...h, streak: calcularStreak(h.datas, hoje) })).sort((a, b) => b.streak - a.streak);

  return (
    <div>
      <div className="df-card" style={{ marginBottom: 20 }}>
        <p className="df-section-label">Minutos — últimos 7 dias</p>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={ultimos7} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 12, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--line)", fontSize: 13, background: "var(--white)", color: "var(--ink)" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="academico" name="Escola/TI" stackId="a" fill="var(--blue)" />
              <Bar dataKey="esporte" name="Treino" stackId="a" fill="var(--ink)" />
              <Bar dataKey="bemestar" name="Bem-estar" stackId="a" fill="var(--green)" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {temHumor && (
        <div className="df-card" style={{ marginBottom: 20 }}>
          <p className="df-section-label">Humor — últimos 7 dias</p>
          <div style={{ width: "100%", height: 140 }}>
            <ResponsiveContainer>
              <LineChart data={humorSemana} margin={{ left: -20, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                <XAxis dataKey="dia" tick={{ fontSize: 12, fill: "var(--ink-soft)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tickFormatter={(v) => HUMOR_EMOJI[v]} tick={{ fontSize: 13 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip formatter={(v) => [HUMOR_EMOJI[v] || "—", "Humor"]} contentStyle={{ borderRadius: 8, border: "1px solid var(--line)", fontSize: 13, background: "var(--white)", color: "var(--ink)" }} />
                <Line type="monotone" dataKey="humor" stroke="var(--blue)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--blue)" }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {habitosOrdenados.length > 0 && (
        <div className="df-card" style={{ marginBottom: 20 }}>
          <p className="df-section-label">Sequência de hábitos</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {habitosOrdenados.map((h) => (
              <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ flex: 1, fontSize: 13 }}>{h.nome}</span>
                <Flame size={13} color={h.streak > 0 ? "var(--red)" : "var(--line)"} />
                <span style={{ fontSize: 12.5, fontWeight: 700, minWidth: 60, textAlign: "right" }}>{h.streak} dia{h.streak !== 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="df-section-label">Nível por área</p>
      {dados.areas.length === 0 ? <EmptyState texto="Cadastre áreas pra ver o panorama aqui." /> : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {dados.areas.map((a) => (
            <div key={a.id} className="df-ring-card">
              <GrowthRing level={a.mastery} size={40} cor={a.tipo === "esporte" ? "var(--ink)" : a.tipo === "bemestar" ? "var(--green)" : "var(--blue)"} />
              <span className="df-ring-nome">{a.nome}</span>
            </div>
          ))}
        </div>
      )}

      <div className="df-info-box" style={{ marginTop: 24 }}>
        <p className="df-info-titulo">Sobre as integrações</p>
        <p className="df-info-texto">
          Cada tarefa da Agenda pode ser exportada pro Google Calendar com um clique, ou baixada como arquivo
          .ics — que funciona no Apple Calendar, Outlook e qualquer outro app. Sincronização automática de mão
          dupla e notificações push de verdade no celular exigem configuração adicional — veja a aba Configurações.
        </p>
      </div>
    </div>
  );
}
