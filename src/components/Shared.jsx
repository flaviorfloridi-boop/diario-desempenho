import { BookOpen, Dumbbell, HeartPulse, Circle } from "lucide-react";

export function TipoBadge({ tipo }) {
  const map = {
    academico: { label: "Escola/TI", cls: "df-badge-academico", icon: BookOpen },
    esporte: { label: "Treino", cls: "df-badge-esporte", icon: Dumbbell },
    bemestar: { label: "Bem-estar", cls: "df-badge-bemestar", icon: HeartPulse },
    geral: { label: "Geral", cls: "df-badge-geral", icon: Circle },
  };
  const m = map[tipo] || map.geral;
  const Icon = m.icon;
  return (
    <span className={`df-badge ${m.cls}`}>
      <Icon size={10} /> {m.label}
    </span>
  );
}

export function EmptyState({ texto }) {
  return <div className="df-empty">{texto}</div>;
}
