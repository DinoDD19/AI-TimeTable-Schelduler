import { BarChart3, Users, Building2, Target } from 'lucide-react';
import { SchedulerStats } from '@/types/scheduler';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  stats: SchedulerStats | null;
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
  const cards = [
    {
      label: 'Total Classes',
      value: stats?.totalClasses ?? '-',
      icon: BarChart3,
      color: 'primary',
      suffix: '',
    },
    {
      label: 'Faculty Utilization',
      value: stats?.facultyUtilization ?? '-',
      icon: Users,
      color: 'accent',
      suffix: '%',
    },
    {
      label: 'Room Utilization',
      value: stats?.classroomUtilization ?? '-',
      icon: Building2,
      color: 'success',
      suffix: '%',
    },
    {
      label: 'Preference Score',
      value: stats?.preferenceScore ?? '-',
      icon: Target,
      color: 'warning',
      suffix: '%',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={card.label}
          className={cn(
            "bg-card rounded-xl border border-border p-4 animate-slide-up",
          )}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              card.color === 'primary' && "bg-primary/10",
              card.color === 'accent' && "bg-accent/10",
              card.color === 'success' && "bg-success/10",
              card.color === 'warning' && "bg-warning/10",
            )}>
              <card.icon className={cn(
                "w-5 h-5",
                card.color === 'primary' && "text-primary",
                card.color === 'accent' && "text-accent",
                card.color === 'success' && "text-success",
                card.color === 'warning' && "text-warning",
              )} />
            </div>
          </div>
          
          <div>
            <p className="text-2xl font-bold text-foreground">
              {card.value}{typeof card.value === 'number' ? card.suffix : ''}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
