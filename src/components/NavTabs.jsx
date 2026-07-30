import { LayoutDashboard, CalendarDays, NotebookPen, BookOpen, TrendingUp, Settings, Flame, Heart, Target, Kanban } from "lucide-react";

const TABS = [
  { id: "hoje", label: "Hoje", icon: LayoutDashboard },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "tarefas", label: "Tarefas", icon: Kanban },
  { id: "registro", label: "Registro", icon: NotebookPen },
  { id: "areas", label: "Áreas", icon: BookOpen },
  { id: "habitos", label: "Hábitos", icon: Flame },
  { id: "diario", label: "Diário", icon: Heart },
  { id: "metas", label: "Metas", icon: Target },
  { id: "painel", label: "Painel", icon: TrendingUp },
  { id: "config", label: "Configurações", icon: Settings },
];

export function NavTabs({ tab, setTab }) {
  return (
    <nav className="df-nav">
      <div className="df-nav-inner">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} className={`df-tab ${active ? "active" : ""}`} onClick={() => setTab(t.id)}>
              <Icon size={15} strokeWidth={2.3} />
              {t.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
