import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { EnhancedScheduleEntry, Subject, Faculty, Classroom, TimeSlot, WeekDay } from '@/types/scheduler';
import { TimeSlotCard } from './TimeSlotCard';
import { cn } from '@/lib/utils';

interface EnhancedTimetableGridProps {
  entries: EnhancedScheduleEntry[];
  subjects: Subject[];
  faculty: Faculty[];
  classrooms: Classroom[];
  workingDays: WeekDay[];
  dailySlots: TimeSlot[];
  onMoveEntry: (entryId: string, newDay: WeekDay, newSlot: TimeSlot) => { success: boolean; conflicts: any[] };
  onToggleSlotState: (entryId: string, stateKey: 'isLocked' | 'isPreferred' | 'isAvoided') => void;
  onDeleteEntry: (entryId: string) => void;
}

const dayLabels: Record<WeekDay, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
};

export const EnhancedTimetableGrid = ({
  entries,
  subjects,
  faculty,
  classrooms,
  workingDays,
  dailySlots,
  onMoveEntry,
  onToggleSlotState,
  onDeleteEntry,
}: EnhancedTimetableGridProps) => {
  const entriesBySlot = useMemo(() => {
    const map = new Map<string, EnhancedScheduleEntry>();
    entries.forEach(entry => {
      const key = `${entry.day}-${entry.timeSlot.start}`;
      map.set(key, entry);
    });
    return map;
  }, [entries]);

  const getSubject = (id: string) => subjects.find(s => s.id === id);
  const getFaculty = (id: string) => faculty.find(f => f.id === id);
  const getClassroom = (id: string) => classrooms.find(c => c.id === id);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const [destDay, destSlotStart] = result.destination.droppableId.split('-');
    const destSlot = dailySlots.find(s => s.start === destSlotStart);
    
    if (destSlot) {
      onMoveEntry(result.draggableId, destDay as WeekDay, destSlot);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border overflow-hidden shadow-card"
      >
        {/* Header */}
        <div className="grid grid-cols-[80px_repeat(5,1fr)] bg-secondary/50">
          <div className="p-3 border-r border-b border-border flex items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground">🕐 Time</span>
          </div>
          {workingDays.map((day, index) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 text-center border-r border-b border-border last:border-r-0"
            >
              <span className="font-semibold text-foreground">{dayLabels[day]}</span>
            </motion.div>
          ))}
        </div>

        {/* Time Slots */}
        {dailySlots.map((slot, slotIndex) => (
          <motion.div
            key={slot.start}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: slotIndex * 0.03 }}
            className="grid grid-cols-[80px_repeat(5,1fr)]"
          >
            {/* Time Label */}
            <div className="p-3 border-r border-b border-border flex items-center justify-center bg-secondary/30">
              <div className="text-center">
                <span className="text-xs font-medium text-foreground block">{slot.start}</span>
                <span className="text-[10px] text-muted-foreground">{slot.end}</span>
              </div>
            </div>

            {/* Day Cells */}
            {workingDays.map(day => {
              const key = `${day}-${slot.start}`;
              const entry = entriesBySlot.get(key);
              const droppableId = `${day}-${slot.start}`;

              return (
                <Droppable key={key} droppableId={droppableId}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "p-1.5 border-r border-b border-border last:border-r-0 min-h-[90px] transition-all duration-200",
                        snapshot.isDraggingOver && "bg-primary/5 ring-2 ring-primary ring-inset",
                        !entry && "hover:bg-secondary/30"
                      )}
                    >
                      <AnimatePresence mode="popLayout">
                        {entry && (
                          <Draggable
                            key={entry.id}
                            draggableId={entry.id}
                            index={0}
                            isDragDisabled={entry.slotState.isLocked}
                          >
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                className="h-full"
                              >
                                <TimeSlotCard
                                  entry={entry}
                                  subject={getSubject(entry.subjectId)}
                                  facultyMember={getFaculty(entry.facultyId)}
                                  classroom={getClassroom(entry.classroomId)}
                                  isDragging={dragSnapshot.isDragging}
                                  onToggleLock={() => onToggleSlotState(entry.id, 'isLocked')}
                                  onTogglePreferred={() => onToggleSlotState(entry.id, 'isPreferred')}
                                  onDelete={() => onDeleteEntry(entry.id)}
                                />
                              </div>
                            )}
                          </Draggable>
                        )}
                      </AnimatePresence>
                      {provided.placeholder}
                      
                      {/* Empty slot indicator */}
                      {!entry && !snapshot.isDraggingOver && (
                        <div className="h-full flex items-center justify-center text-muted-foreground/30">
                          <span className="text-xs">Drop here</span>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              );
            })}
          </motion.div>
        ))}
      </motion.div>
    </DragDropContext>
  );
};
