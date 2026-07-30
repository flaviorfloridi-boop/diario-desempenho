import { BookOpen, Dumbbell, Circle } from "lucide-react";

export function TipoBadge({ tipo }) {
  const map = {
    academico: { label: "Acadêmico", cls: "df-badge-academico", icon: BookOpen },
    esporte: { label: "Esporte", cls: "df-badge-esporte", icon: Dumbbell },
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
