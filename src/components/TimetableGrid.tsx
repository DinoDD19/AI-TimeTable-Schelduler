import { useMemo, useState } from 'react';
import { GripVertical, X, Clock, MapPin, User } from 'lucide-react';
import { ScheduleEntry, Subject, Faculty, Classroom, TimeSlot, WeekDay } from '@/types/scheduler';
import { subjectColorClasses } from '@/data/dummyData';
import { cn } from '@/lib/utils';

interface TimetableGridProps {
  entries: ScheduleEntry[];
  subjects: Subject[];
  faculty: Faculty[];
  classrooms: Classroom[];
  workingDays: WeekDay[];
  dailySlots: TimeSlot[];
  onDeleteEntry: (entryId: string) => void;
  onUpdateEntry: (entryId: string, updates: Partial<ScheduleEntry>) => void;
}

const dayLabels: Record<WeekDay, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
};

export const TimetableGrid = ({
  entries,
  subjects,
  faculty,
  classrooms,
  workingDays,
  dailySlots,
  onDeleteEntry,
}: TimetableGridProps) => {
  const [draggedEntry, setDraggedEntry] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ day: WeekDay; slot: TimeSlot } | null>(null);

  // Group entries by day and slot
  const entriesBySlot = useMemo(() => {
    const map = new Map<string, ScheduleEntry>();
    entries.forEach(entry => {
      const key = `${entry.day}-${entry.timeSlot.start}`;
      map.set(key, entry);
    });
    return map;
  }, [entries]);

  const getSubject = (id: string) => subjects.find(s => s.id === id);
  const getFaculty = (id: string) => faculty.find(f => f.id === id);
  const getClassroom = (id: string) => classrooms.find(c => c.id === id);

  const handleDragStart = (entryId: string) => {
    setDraggedEntry(entryId);
  };

  const handleDragEnd = () => {
    setDraggedEntry(null);
    setDropTarget(null);
  };

  const handleDragOver = (day: WeekDay, slot: TimeSlot) => {
    setDropTarget({ day, slot });
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
      {/* Grid Header */}
      <div className="grid grid-cols-[80px_repeat(5,1fr)] bg-secondary/50">
        <div className="p-3 border-r border-b border-border" />
        {workingDays.map(day => (
          <div
            key={day}
            className="p-3 text-center border-r border-b border-border last:border-r-0"
          >
            <span className="font-semibold text-foreground">{dayLabels[day]}</span>
          </div>
        ))}
      </div>

      {/* Time Slots */}
      {dailySlots.map((slot, slotIndex) => (
        <div key={slot.start} className="grid grid-cols-[80px_repeat(5,1fr)]">
          {/* Time Label */}
          <div className="p-3 border-r border-b border-border flex items-center justify-center">
            <div className="text-center">
              <span className="text-xs font-medium text-foreground block">{slot.start}</span>
              <span className="text-xs text-muted-foreground">{slot.end}</span>
            </div>
          </div>

          {/* Day Cells */}
          {workingDays.map(day => {
            const key = `${day}-${slot.start}`;
            const entry = entriesBySlot.get(key);
            const isDropTarget = dropTarget?.day === day && dropTarget?.slot.start === slot.start;

            return (
              <div
                key={key}
                className={cn(
                  "p-2 border-r border-b border-border last:border-r-0 min-h-[100px] transition-all duration-200",
                  isDropTarget && "bg-primary/5 ring-2 ring-primary ring-inset",
                  !entry && "hover:bg-secondary/30"
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  handleDragOver(day, slot);
                }}
                onDragLeave={() => setDropTarget(null)}
              >
                {entry && (
                  <TimetableCell
                    entry={entry}
                    subject={getSubject(entry.subjectId)}
                    facultyMember={getFaculty(entry.facultyId)}
                    classroom={getClassroom(entry.classroomId)}
                    isDragging={draggedEntry === entry.id}
                    onDragStart={() => handleDragStart(entry.id)}
                    onDragEnd={handleDragEnd}
                    onDelete={() => onDeleteEntry(entry.id)}
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

interface TimetableCellProps {
  entry: ScheduleEntry;
  subject?: Subject;
  facultyMember?: Faculty;
  classroom?: Classroom;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDelete: () => void;
}

const TimetableCell = ({
  subject,
  facultyMember,
  classroom,
  isDragging,
  onDragStart,
  onDragEnd,
  onDelete,
}: TimetableCellProps) => {
  if (!subject) return null;

  const colors = subjectColorClasses[subject.color] || subjectColorClasses.math;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative h-full rounded-lg border p-2.5 cursor-move transition-all duration-200",
        colors.bg,
        colors.border,
        isDragging && "opacity-50 scale-105 shadow-lg rotate-2"
      )}
    >
      {/* Drag Handle */}
      <div className="absolute top-1.5 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className={cn("w-3.5 h-3.5", colors.text, "opacity-50")} />
      </div>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/20"
      >
        <X className="w-3.5 h-3.5 text-destructive" />
      </button>

      {/* Content */}
      <div className="pl-3">
        <h4 className={cn("font-semibold text-sm mb-1", colors.text)}>
          {subject.code}
        </h4>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
          {subject.name}
        </p>

        <div className="space-y-1">
          {facultyMember && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span className="truncate">{facultyMember.name.split(' ')[1]}</span>
            </div>
          )}
          {classroom && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{classroom.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
