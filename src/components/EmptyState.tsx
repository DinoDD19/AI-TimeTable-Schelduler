import { Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onGenerate: () => void;
  isGenerating: boolean;
}

export const EmptyState = ({ onGenerate, isGenerating }: EmptyStateProps) => {
  return (
    <div className="bg-card rounded-xl border border-border p-12 text-center animate-fade-in">
      <div className="max-w-md mx-auto">
        <div className="w-20 h-20 rounded-2xl bg-gradient-primary mx-auto mb-6 flex items-center justify-center shadow-glow animate-float">
          <Calendar className="w-10 h-10 text-primary-foreground" />
        </div>
        
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Ready to Generate Your Timetable
        </h3>
        <p className="text-muted-foreground mb-6">
          Our AI-powered scheduler will analyze your subjects, faculty availability, 
          and preferences to create an optimal, conflict-free timetable.
        </p>

        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          size="lg"
          className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Generate Optimal Schedule
        </Button>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'No Conflicts', desc: 'Zero overlapping classes' },
            { label: 'Optimized', desc: 'Best slot allocation' },
            { label: 'Flexible', desc: 'Easy to customize' },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded-lg bg-secondary/50">
              <p className="font-medium text-sm text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
