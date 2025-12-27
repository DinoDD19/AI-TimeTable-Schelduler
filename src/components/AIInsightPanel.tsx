import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, AlertTriangle, Info, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { AIInsight, Conflict } from '@/types/scheduler';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AIInsightPanelProps {
  insights: AIInsight[];
  conflicts: Conflict[];
  isGenerating?: boolean;
  onDismissInsight?: (id: string) => void;
}

/**
 * AIInsightPanel - Shows AI suggestions and explanations
 * Features human-readable insights about scheduling decisions
 */
export const AIInsightPanel = ({
  insights,
  conflicts,
  isGenerating = false,
  onDismissInsight,
}: AIInsightPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleInsights = insights.filter(i => !dismissedIds.has(i.id));
  const hasWarnings = conflicts.length > 0;

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
    onDismissInsight?.(id);
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'suggestion':
        return <Lightbulb className="w-4 h-4 text-warning" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'explanation':
      default:
        return <Info className="w-4 h-4 text-info" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">AI Insights</h3>
            <p className="text-xs text-muted-foreground">
              {visibleInsights.length} suggestion{visibleInsights.length !== 1 ? 's' : ''}
              {hasWarnings && ` • ${conflicts.length} warning${conflicts.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-3">
              {/* Generating indicator */}
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20"
                >
                  <div className="relative">
                    <div className="w-4 h-4 rounded-full bg-primary animate-ping absolute" />
                    <div className="w-4 h-4 rounded-full bg-primary relative" />
                  </div>
                  <span className="text-sm text-primary font-medium">
                    Analyzing optimal schedule...
                  </span>
                </motion.div>
              )}

              {/* Conflicts first */}
              <AnimatePresence>
                {conflicts.map((conflict, index) => (
                  <motion.div
                    key={`conflict-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border",
                      conflict.severity === 'error' 
                        ? "bg-destructive/5 border-destructive/20"
                        : "bg-warning/5 border-warning/20"
                    )}
                  >
                    <AlertTriangle className={cn(
                      "w-4 h-4 mt-0.5",
                      conflict.severity === 'error' ? "text-destructive" : "text-warning"
                    )} />
                    <div className="flex-1">
                      <p className={cn(
                        "text-sm font-medium",
                        conflict.severity === 'error' ? "text-destructive" : "text-warning"
                      )}>
                        {conflict.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {conflict.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Insights */}
              <AnimatePresence>
                {visibleInsights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: (conflicts.length + index) * 0.1 }}
                    className="group flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <span className="text-lg">{insight.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">
                        {insight.message}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDismiss(insight.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Empty state */}
              {!isGenerating && visibleInsights.length === 0 && conflicts.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">No insights yet</p>
                  <p className="text-xs mt-1">Generate a timetable to see AI suggestions</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
