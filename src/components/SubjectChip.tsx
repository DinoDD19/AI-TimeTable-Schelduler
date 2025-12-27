import { motion } from 'framer-motion';
import { Subject } from '@/types/scheduler';
import { subjectColorClasses } from '@/data/dummyData';
import { cn } from '@/lib/utils';

interface SubjectChipProps {
  subject: Subject;
  isDragging?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showHours?: boolean;
}

/**
 * SubjectChip - A draggable chip representing a subject
 * Can be used in the subject palette for drag-and-drop
 */
export const SubjectChip = ({
  subject,
  isDragging = false,
  onClick,
  size = 'md',
  showHours = false,
}: SubjectChipProps) => {
  const colors = subjectColorClasses[subject.color] || subjectColorClasses.math;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isDragging ? 1.1 : 1,
        rotate: isDragging ? 3 : 0,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border cursor-pointer",
        colors.bg,
        colors.border,
        sizeClasses[size],
        isDragging && "shadow-lg ring-2 ring-primary",
        "focus-ring"
      )}
      tabIndex={0}
      role="button"
      aria-label={subject.name}
    >
      {/* Subject icon */}
      <span role="img" aria-hidden="true">
        {subject.icon}
      </span>

      {/* Subject code */}
      <span className={cn("font-medium", colors.text)}>
        {subject.code}
      </span>

      {/* Hours per week badge */}
      {showHours && (
        <span className={cn(
          "text-[10px] px-1.5 py-0.5 rounded-full",
          colors.solid,
          "text-white"
        )}>
          {subject.hoursPerWeek}h
        </span>
      )}

      {/* Difficulty indicator */}
      <span className={cn(
        "w-2 h-2 rounded-full",
        subject.difficulty === 'easy' && "bg-success",
        subject.difficulty === 'medium' && "bg-warning",
        subject.difficulty === 'hard' && "bg-destructive",
      )} />
    </motion.div>
  );
};

/**
 * SubjectPalette - A grid of draggable subject chips
 */
interface SubjectPaletteProps {
  subjects: Subject[];
  onSubjectClick?: (subject: Subject) => void;
}

export const SubjectPalette = ({ subjects, onSubjectClick }: SubjectPaletteProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-wrap gap-2 p-4 bg-card rounded-xl border border-border"
    >
      <div className="w-full text-sm font-medium text-muted-foreground mb-2">
        📚 Drag subjects to the timetable
      </div>
      {subjects.map((subject, index) => (
        <motion.div
          key={subject.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <SubjectChip
            subject={subject}
            onClick={() => onSubjectClick?.(subject)}
            showHours
          />
        </motion.div>
      ))}
    </motion.div>
  );
};
