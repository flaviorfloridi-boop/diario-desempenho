import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from "recharts";
import { todayISO, addDaysISO } from "../lib/dates";
import { GrowthRing } from "./GrowthRing";
import { EmptyState } from "./Shared";

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

  return (
    <div>
      <div className="df-card" style={{ marginBottom: 20 }}>
        <p className="df-section-label">Minutos — últimos 7 dias</p>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={ultimos7} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e1e5f0" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 12, fill: "#5b6272" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#5b6272" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e1e5f0", fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="academico" name="Escola/TI" stackId="a" fill="#2b5cf0" />
              <Bar dataKey="esporte" name="Treino" stackId="a" fill="#0b0e14" />
              <Bar dataKey="bemestar" name="Bem-estar" stackId="a" fill="#0f6b47" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="df-section-label">Nível por área</p>
      {dados.areas.length === 0 ? <EmptyState texto="Cadastre áreas pra ver o panorama aqui." /> : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {dados.areas.map((a) => (
            <div key={a.id} className="df-ring-card">
              <GrowthRing level={a.mastery} size={40} cor={a.tipo === "esporte" ? "#0b0e14" : a.tipo === "bemestar" ? "#0f6b47" : "#2b5cf0"} />
              <span className="df-ring-nome">{a.nome}</span>
            </div>
          ))}
        </div>
      )}

      <div className="df-info-box" style={{ marginTop: 24 }}>
        <p className="df-info-titulo">Sobre as integrações</p>
        <p className="df-info-texto">
          Cada tarefa da Agenda tem um botão pra exportar direto pro seu Google Calendar. Sincronização automática
          nos dois sentidos e notificações push de verdade no celular exigem configuração adicional — veja a aba
          Configurações.
        </p>
      </div>
    </div>
  );
}
