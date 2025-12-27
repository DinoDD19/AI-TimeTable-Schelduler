// Constraint-based timetable scheduling algorithm with AI insights
import { 
  Subject, 
  Faculty, 
  Classroom, 
  TimeSlot, 
  WeekDay, 
  StudentPreferences, 
  EnhancedScheduleEntry, 
  GeneratedTimetable,
  Conflict,
  SchedulerStats,
  AIInsight,
  SlotState
} from '@/types/scheduler';
import { aiInsightTemplates } from '@/data/dummyData';

interface SchedulerConfig {
  subjects: Subject[];
  faculty: Faculty[];
  classrooms: Classroom[];
  preferences: StudentPreferences;
  workingDays: WeekDay[];
  dailySlots: TimeSlot[];
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Create default slot state
const createDefaultSlotState = (): SlotState => ({
  isLocked: false,
  isPreferred: false,
  isAvoided: false,
  hasConflict: false,
});

// Check if two time slots overlap
const slotsOverlap = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
  const start1 = parseInt(slot1.start.replace(':', ''));
  const end1 = parseInt(slot1.end.replace(':', ''));
  const start2 = parseInt(slot2.start.replace(':', ''));
  const end2 = parseInt(slot2.end.replace(':', ''));
  return !(end1 <= start2 || end2 <= start1);
};

// Check if faculty is available at given day and slot
const isFacultyAvailable = (faculty: Faculty, day: WeekDay, slot: TimeSlot): boolean => {
  const dayAvailability = faculty.availability[day];
  if (!dayAvailability || dayAvailability.length === 0) return false;
  
  return dayAvailability.some(availSlot => {
    const availStart = parseInt(availSlot.start.replace(':', ''));
    const availEnd = parseInt(availSlot.end.replace(':', ''));
    const slotStart = parseInt(slot.start.replace(':', ''));
    const slotEnd = parseInt(slot.end.replace(':', ''));
    return slotStart >= availStart && slotEnd <= availEnd;
  });
};

// Generate AI reason for slot selection
const generateAIReason = (
  subject: Subject,
  slot: TimeSlot,
  preferences: StudentPreferences
): string => {
  const slotHour = parseInt(slot.start.split(':')[0]);
  
  if (preferences.preferMorning && subject.difficulty === 'hard' && slotHour <= 11) {
    return aiInsightTemplates.morningHard(subject.name);
  }
  
  if (preferences.preferEvenDistribution) {
    return aiInsightTemplates.evenDistribution(subject.name);
  }
  
  return `📅 Best available slot for ${subject.name}`;
};

// Calculate slot score based on preferences
const calculateSlotScore = (
  slot: TimeSlot, 
  subject: Subject, 
  preferences: StudentPreferences,
  existingDayEntries: EnhancedScheduleEntry[],
  subjects: Subject[]
): number => {
  let score = 100;
  
  const slotHour = parseInt(slot.start.split(':')[0]);
  
  // Prefer morning for difficult subjects
  if (preferences.preferMorning && subject.difficulty === 'hard') {
    if (slotHour <= 11) score += 20;
    else score -= 10;
  }
  
  // Avoid consecutive difficult subjects
  if (preferences.avoidDifficultConsecutive && subject.difficulty === 'hard') {
    const slotIndex = parseInt(slot.start.replace(':', ''));
    existingDayEntries.forEach(entry => {
      const entrySubject = subjects.find(s => s.id === entry.subjectId);
      if (entrySubject?.difficulty === 'hard') {
        const entryEnd = parseInt(entry.timeSlot.end.replace(':', ''));
        const entryStart = parseInt(entry.timeSlot.start.replace(':', ''));
        if (Math.abs(slotIndex - entryEnd) <= 100 || Math.abs(slotIndex - entryStart) <= 100) {
          score -= 30;
        }
      }
    });
  }
  
  // Add randomness for variety
  score += Math.random() * 10;
  
  return score;
};

// Main scheduling algorithm
export const generateTimetable = (config: SchedulerConfig): GeneratedTimetable => {
  const { subjects, faculty, classrooms, preferences, workingDays, dailySlots } = config;
  
  const entries: EnhancedScheduleEntry[] = [];
  const conflicts: Conflict[] = [];
  const aiInsights: AIInsight[] = [];
  
  // Track usage
  const facultyDayHours: Map<string, Map<string, number>> = new Map();
  const classroomSchedule: Map<string, Map<string, Map<string, boolean>>> = new Map();
  const facultySchedule: Map<string, Map<string, Map<string, boolean>>> = new Map();
  
  // Initialize tracking
  faculty.forEach(f => {
    facultyDayHours.set(f.id, new Map());
    facultySchedule.set(f.id, new Map());
    workingDays.forEach(day => {
      facultyDayHours.get(f.id)!.set(day, 0);
      facultySchedule.get(f.id)!.set(day, new Map());
    });
  });
  
  classrooms.forEach(c => {
    classroomSchedule.set(c.id, new Map());
    workingDays.forEach(day => {
      classroomSchedule.get(c.id)!.set(day, new Map());
    });
  });
  
  // Create class requirements
  const classRequirements: { subject: Subject; faculty: Faculty; remaining: number }[] = [];
  
  subjects.forEach(subject => {
    const subjectFaculty = faculty.find(f => f.subjects.includes(subject.id));
    if (subjectFaculty) {
      classRequirements.push({
        subject,
        faculty: subjectFaculty,
        remaining: subject.hoursPerWeek,
      });
    }
  });
  
  // Sort by difficulty (schedule harder subjects first)
  classRequirements.sort((a, b) => {
    const difficultyOrder = { hard: 0, medium: 1, easy: 2 };
    return difficultyOrder[a.subject.difficulty] - difficultyOrder[b.subject.difficulty];
  });
  
  // Schedule each class
  for (const req of classRequirements) {
    const { subject, faculty: assignedFaculty } = req;
    
    while (req.remaining > 0) {
      let bestSlot: { day: WeekDay; slot: TimeSlot; classroom: Classroom; score: number } | null = null;
      
      // Distribution tracking
      const dayCounts = new Map<WeekDay, number>();
      workingDays.forEach(day => {
        const count = entries.filter(e => e.subjectId === subject.id && e.day === day).length;
        dayCounts.set(day, count);
      });
      
      const sortedDays = [...workingDays].sort((a, b) => 
        (dayCounts.get(a) || 0) - (dayCounts.get(b) || 0)
      );
      
      for (const day of sortedDays) {
        const facultyHours = facultyDayHours.get(assignedFaculty.id)!.get(day) || 0;
        if (facultyHours >= assignedFaculty.maxHoursPerDay) continue;
        
        for (const slot of dailySlots) {
          if (!isFacultyAvailable(assignedFaculty, day, slot)) continue;
          
          const slotKey = `${slot.start}-${slot.end}`;
          if (facultySchedule.get(assignedFaculty.id)!.get(day)!.get(slotKey)) continue;
          
          for (const classroom of classrooms) {
            if (classroomSchedule.get(classroom.id)!.get(day)!.get(slotKey)) continue;
            
            const existingDayEntries = entries.filter(e => e.day === day);
            const score = calculateSlotScore(slot, subject, preferences, existingDayEntries, subjects);
            
            if (preferences.preferEvenDistribution) {
              const dayCount = dayCounts.get(day) || 0;
              const bonus = Math.max(0, 20 - dayCount * 10);
              const adjustedScore = score + bonus;
              
              if (!bestSlot || adjustedScore > bestSlot.score) {
                bestSlot = { day, slot, classroom, score: adjustedScore };
              }
            } else if (!bestSlot || score > bestSlot.score) {
              bestSlot = { day, slot, classroom, score };
            }
          }
        }
      }
      
      if (bestSlot) {
        const entry: EnhancedScheduleEntry = {
          id: generateId(),
          subjectId: subject.id,
          facultyId: assignedFaculty.id,
          classroomId: bestSlot.classroom.id,
          day: bestSlot.day,
          timeSlot: bestSlot.slot,
          slotState: createDefaultSlotState(),
          aiReason: generateAIReason(subject, bestSlot.slot, preferences),
        };
        
        entries.push(entry);
        
        // Add AI insight for the first few entries
        if (entries.length <= 5) {
          aiInsights.push({
            id: generateId(),
            type: 'explanation',
            message: entry.aiReason || '',
            relatedEntryId: entry.id,
            icon: subject.icon || '📚',
          });
        }
        
        // Update tracking
        const slotKey = `${bestSlot.slot.start}-${bestSlot.slot.end}`;
        facultySchedule.get(assignedFaculty.id)!.get(bestSlot.day)!.set(slotKey, true);
        classroomSchedule.get(bestSlot.classroom.id)!.get(bestSlot.day)!.set(slotKey, true);
        
        const currentHours = facultyDayHours.get(assignedFaculty.id)!.get(bestSlot.day) || 0;
        facultyDayHours.get(assignedFaculty.id)!.set(bestSlot.day, currentHours + 1);
        
        req.remaining--;
      } else {
        conflicts.push({
          type: 'availability',
          description: `Could not schedule ${subject.name} - no available slots`,
          entries: [],
          severity: 'error',
        });
        break;
      }
    }
  }
  
  // Add general AI insights
  if (preferences.preferMorning) {
    aiInsights.push({
      id: generateId(),
      type: 'suggestion',
      message: '🌅 Difficult subjects scheduled in morning for optimal focus',
      icon: '💡',
    });
  }
  
  if (preferences.preferEvenDistribution) {
    aiInsights.push({
      id: generateId(),
      type: 'suggestion',
      message: '📊 Classes distributed evenly for balanced weekly workload',
      icon: '⚖️',
    });
  }
  
  const maxPossible = subjects.reduce((acc, s) => acc + s.hoursPerWeek, 0);
  const scheduled = entries.length;
  const score = (scheduled / maxPossible) * 100;
  
  return { entries, conflicts, score, aiInsights };
};

// Calculate scheduler statistics
export const calculateStats = (
  entries: EnhancedScheduleEntry[],
  config: SchedulerConfig
): SchedulerStats => {
  const { subjects, faculty, classrooms, workingDays, dailySlots } = config;
  
  const totalPossibleClasses = subjects.reduce((acc, s) => acc + s.hoursPerWeek, 0);
  const totalClasses = entries.length;
  
  const totalFacultySlots = faculty.reduce((acc, f) => {
    let slots = 0;
    workingDays.forEach(day => {
      if (f.availability[day]) {
        slots += Math.min(f.maxHoursPerDay, dailySlots.length);
      }
    });
    return acc + slots;
  }, 0);
  
  const usedFacultySlots = entries.length;
  const facultyUtilization = (usedFacultySlots / totalFacultySlots) * 100;
  
  const totalClassroomSlots = classrooms.length * workingDays.length * dailySlots.length;
  const classroomUtilization = (entries.length / totalClassroomSlots) * 100;
  
  const preferenceScore = totalClasses >= totalPossibleClasses ? 100 : (totalClasses / totalPossibleClasses) * 100;
  
  const conflictCount = entries.filter(e => e.slotState.hasConflict).length;
  
  return {
    totalClasses,
    facultyUtilization: Math.round(facultyUtilization * 10) / 10,
    classroomUtilization: Math.round(classroomUtilization * 10) / 10,
    preferenceScore: Math.round(preferenceScore * 10) / 10,
    conflictCount,
  };
};

// Validate timetable for conflicts
export const validateTimetable = (
  entries: EnhancedScheduleEntry[],
  faculty: Faculty[],
  classrooms: Classroom[]
): Conflict[] => {
  const conflicts: Conflict[] = [];
  
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const e1 = entries[i];
      const e2 = entries[j];
      
      if (e1.day !== e2.day) continue;
      if (!slotsOverlap(e1.timeSlot, e2.timeSlot)) continue;
      
      if (e1.facultyId === e2.facultyId) {
        conflicts.push({
          type: 'faculty_overlap',
          description: 'Faculty assigned to multiple classes at the same time',
          entries: [e1.id, e2.id],
          severity: 'error',
        });
      }
      
      if (e1.classroomId === e2.classroomId) {
        conflicts.push({
          type: 'classroom_overlap',
          description: 'Classroom double-booked',
          entries: [e1.id, e2.id],
          severity: 'error',
        });
      }
    }
  }
  
  return conflicts;
};

// Check if moving an entry would cause conflicts
export const checkMoveConflicts = (
  entry: EnhancedScheduleEntry,
  newDay: WeekDay,
  newSlot: TimeSlot,
  newClassroomId: string,
  existingEntries: EnhancedScheduleEntry[],
  faculty: Faculty[]
): Conflict[] => {
  const conflicts: Conflict[] = [];
  
  // Check faculty availability
  const assignedFaculty = faculty.find(f => f.id === entry.facultyId);
  if (assignedFaculty && !isFacultyAvailable(assignedFaculty, newDay, newSlot)) {
    conflicts.push({
      type: 'availability',
      description: `${assignedFaculty.name} is not available at this time`,
      entries: [entry.id],
      severity: 'error',
    });
  }
  
  // Check for overlaps with other entries
  existingEntries.forEach(e => {
    if (e.id === entry.id) return;
    if (e.day !== newDay) return;
    if (!slotsOverlap(e.timeSlot, newSlot)) return;
    
    if (e.facultyId === entry.facultyId) {
      conflicts.push({
        type: 'faculty_overlap',
        description: 'Faculty already has a class at this time',
        entries: [entry.id, e.id],
        severity: 'error',
      });
    }
    
    if (e.classroomId === newClassroomId) {
      conflicts.push({
        type: 'classroom_overlap',
        description: 'Classroom is already booked at this time',
        entries: [entry.id, e.id],
        severity: 'error',
      });
    }
  });
  
  return conflicts;
};
