import { Play, RefreshCw, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SchedulerStats, Conflict } from '@/types/scheduler';

interface HeaderProps {
  onGenerate: () => void;
  onClear: () => void;
  isGenerating: boolean;
  stats: SchedulerStats | null;
  conflicts: Conflict[];
}

export const Header = ({ onGenerate, onClear, isGenerating, stats, conflicts }: HeaderProps) => {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Timetable Generator</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create conflict-free schedules with intelligent optimization
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Stats badges */}
          {stats && (
            <div className="flex items-center gap-2 mr-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                {stats.totalClasses} classes
              </div>
              {conflicts.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/10 text-warning text-xs font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {conflicts.length} conflicts
                </div>
              )}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            disabled={isGenerating}
            className="text-muted-foreground"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear
          </Button>

          <Button
            onClick={onGenerate}
            disabled={isGenerating}
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Generate Schedule
              </>
            )}
          </Button>

          <Button variant="outline" size="icon" className="text-muted-foreground">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
