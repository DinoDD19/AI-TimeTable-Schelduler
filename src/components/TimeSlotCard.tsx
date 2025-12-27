import { motion } from 'framer-motion';
import { User, MapPin, Info, Lock, Star, Ban } from 'lucide-react';
import { Subject, Faculty, Classroom, EnhancedScheduleEntry } from '@/types/scheduler';
import { subjectColorClasses } from '@/data/dummyData';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TimeSlotCardProps {
  entry: EnhancedScheduleEntry;
  subject?: Subject;
  facultyMember?: Faculty;
  classroom?: Classroom;
  isDragging?: boolean;
  isSelected?: boolean;
  onToggleLock?: () => void;
  onTogglePreferred?: () => void;
  onToggleAvoided?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  compact?: boolean;
}

/**
 * TimeSlotCard - A rich, interactive card for timetable entries
 * Features:
 * - Color-coded by subject
 * - Shows faculty, classroom, and AI reasoning
 * - Supports locked, preferred, and avoided states
 * - Animated with Framer Motion
 */
export const TimeSlotCard = ({
  entry,
  subject,
  facultyMember,
  classroom,
  isDragging = false,
  isSelected = false,
  onToggleLock,
  onTogglePreferred,
  onToggleAvoided,
  onDelete,
  onClick,
  compact = false,
}: TimeSlotCardProps) => {
  if (!subject) return null;

  const colors = subjectColorClasses[subject.color] || subjectColorClasses.math;
  const { slotState } = entry;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: isDragging ? 1.05 : 1,
            rotate: isDragging ? 2 : 0,
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          onClick={onClick}
          className={cn(
            "relative h-full rounded-lg border p-2 cursor-pointer transition-shadow",
            colors.bg,
            colors.border,
            isDragging && "shadow-lg ring-2 ring-primary",
            isSelected && "ring-2 ring-primary ring-offset-2",
            slotState.isLocked && "border-dashed border-2 border-muted-foreground/50",
            slotState.isPreferred && "ring-2 ring-success ring-offset-1",
            slotState.isAvoided && "ring-2 ring-destructive ring-offset-1",
            slotState.hasConflict && "ring-2 ring-destructive animate-pulse",
            "group focus-ring"
          )}
          tabIndex={0}
          role="button"
          aria-label={`${subject.name} with ${facultyMember?.name || 'Unknown'} in ${classroom?.name || 'Unknown'}`}
        >
          {/* State indicators */}
          <div className="absolute -top-1 -right-1 flex gap-0.5">
            {slotState.isLocked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-5 h-5 rounded-full bg-muted-foreground flex items-center justify-center"
              >
                <Lock className="w-3 h-3 text-background" />
              </motion.div>
            )}
            {slotState.isPreferred && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-5 h-5 rounded-full bg-success flex items-center justify-center"
              >
                <Star className="w-3 h-3 text-success-foreground" />
              </motion.div>
            )}
            {slotState.isAvoided && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-5 h-5 rounded-full bg-destructive flex items-center justify-center"
              >
                <Ban className="w-3 h-3 text-destructive-foreground" />
              </motion.div>
            )}
          </div>

          {/* Subject icon and code */}
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm" role="img" aria-label={subject.name}>
              {subject.icon}
            </span>
            <h4 className={cn("font-semibold text-sm", colors.text)}>
              {subject.code}
            </h4>
          </div>

          {!compact && (
            <>
              {/* Subject name */}
              <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                {subject.name}
              </p>

              {/* Faculty and classroom info */}
              <div className="space-y-1">
                {facultyMember && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{facultyMember.name.split(' ').slice(-1)[0]}</span>
                  </div>
                )}
                {classroom && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span>{classroom.name}</span>
                  </div>
                )}
              </div>

              {/* Difficulty badge */}
              <div className="mt-2">
                <span className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize",
                  subject.difficulty === 'easy' && "difficulty-easy",
                  subject.difficulty === 'medium' && "difficulty-medium",
                  subject.difficulty === 'hard' && "difficulty-hard",
                )}>
                  {subject.difficulty}
                </span>
              </div>
            </>
          )}

          {/* Quick actions on hover */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute bottom-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {onToggleLock && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleLock(); }}
                className={cn(
                  "p-1 rounded hover:bg-background/50",
                  slotState.isLocked && "text-muted-foreground"
                )}
                title={slotState.isLocked ? "Unlock slot" : "Lock slot"}
              >
                <Lock className="w-3 h-3" />
              </button>
            )}
            {onTogglePreferred && (
              <button
                onClick={(e) => { e.stopPropagation(); onTogglePreferred(); }}
                className={cn(
                  "p-1 rounded hover:bg-background/50",
                  slotState.isPreferred && "text-success"
                )}
                title={slotState.isPreferred ? "Remove preference" : "Mark as preferred"}
              >
                <Star className="w-3 h-3" />
              </button>
            )}
          </motion.div>
        </motion.div>
      </TooltipTrigger>

      <TooltipContent side="right" className="max-w-xs">
        <div className="space-y-2">
          <div className="font-medium">{subject.name}</div>
          <div className="text-xs text-muted-foreground">
            {facultyMember?.name} • {classroom?.name}
          </div>
          {entry.aiReason && (
            <div className="flex items-start gap-2 text-xs bg-muted p-2 rounded">
              <Info className="w-3 h-3 mt-0.5 text-primary flex-shrink-0" />
              <span>{entry.aiReason}</span>
            </div>
          )}
          {slotState.hasConflict && (
            <div className="text-xs text-destructive">
              ⚠️ {slotState.conflictReason}
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
