import { Sun, Moon, Shuffle, Brain } from 'lucide-react';
import { StudentPreferences } from '@/types/scheduler';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface SettingsPanelProps {
  preferences: StudentPreferences;
  onUpdate: (updates: Partial<StudentPreferences>) => void;
}

export const SettingsPanel = ({ preferences, onUpdate }: SettingsPanelProps) => {
  const settings = [
    {
      id: 'preferMorning',
      label: 'Prefer Morning Classes',
      description: 'Schedule difficult subjects in morning slots when students are more focused',
      icon: Sun,
      checked: preferences.preferMorning,
      color: 'warning',
    },
    {
      id: 'preferEvenDistribution',
      label: 'Even Distribution',
      description: 'Distribute subjects evenly across the week to avoid clustering',
      icon: Shuffle,
      checked: preferences.preferEvenDistribution,
      color: 'primary',
    },
    {
      id: 'avoidDifficultConsecutive',
      label: 'Avoid Consecutive Difficult',
      description: 'Prevent scheduling multiple difficult subjects back-to-back',
      icon: Brain,
      checked: preferences.avoidDifficultConsecutive,
      color: 'accent',
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure scheduling preferences and optimization rules
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border divide-y divide-border">
        {settings.map((setting, index) => (
          <div
            key={setting.id}
            className={cn(
              "p-5 flex items-center justify-between animate-slide-up"
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center",
                setting.color === 'warning' && "bg-warning/10",
                setting.color === 'primary' && "bg-primary/10",
                setting.color === 'accent' && "bg-accent/10",
              )}>
                <setting.icon className={cn(
                  "w-5 h-5",
                  setting.color === 'warning' && "text-warning",
                  setting.color === 'primary' && "text-primary",
                  setting.color === 'accent' && "text-accent",
                )} />
              </div>
              <div>
                <h3 className="font-medium text-foreground">{setting.label}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{setting.description}</p>
              </div>
            </div>
            <Switch
              checked={setting.checked}
              onCheckedChange={(checked) => onUpdate({ [setting.id]: checked })}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 p-5 rounded-xl bg-gradient-hero border border-border">
        <h3 className="font-medium text-foreground mb-2">About the Algorithm</h3>
        <p className="text-sm text-muted-foreground">
          Our scheduling algorithm uses constraint satisfaction with preference-based scoring. 
          It prioritizes difficult subjects for optimal time slots while ensuring no faculty 
          or classroom conflicts. The algorithm distributes workload evenly and respects 
          individual faculty availability constraints.
        </p>
      </div>
    </div>
  );
};
