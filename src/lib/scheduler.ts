// Constraint-based timetable scheduling algorithm
import { 
  Subject, 
  Faculty, 
  Classroom, 
  TimeSlot, 
  WeekDay, 
  StudentPreferences, 
  ScheduleEntry, 
  GeneratedTimetable,
  Conflict,
  SchedulerStats
} from '@/types/scheduler';

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

// Calculate slot score based on preferences
const calculateSlotScore = (
  slot: TimeSlot, 
  subject: Subject, 
  preferences: StudentPreferences,
  existingDayEntries: ScheduleEntry[],
  subjects: Subject[]
): number => {
  let score = 100;
  
  const slotHour = parseInt(slot.start.split(':')[0]);
  
  // Prefer morning for difficult subjects if user prefers morning
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
        // Check if consecutive
        if (Math.abs(slotIndex - entryEnd) <= 100 || Math.abs(slotIndex - entryStart) <= 100) {
          score -= 30;
        }
      }
    });
  }
  
  // Add some randomness for variety
  score += Math.random() * 10;
  
  return score;
};

// Main scheduling algorithm
export const generateTimetable = (config: SchedulerConfig): GeneratedTimetable => {
  const { subjects, faculty, classrooms, preferences, workingDays, dailySlots } = config;
  
  const entries: ScheduleEntry[] = [];
  const conflicts: Conflict[] = [];
  
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
  
  // Sort by difficulty (schedule harder subjects first for better slots)
  classRequirements.sort((a, b) => {
    const difficultyOrder = { hard: 0, medium: 1, easy: 2 };
    return difficultyOrder[a.subject.difficulty] - difficultyOrder[b.subject.difficulty];
  });
  
  // Schedule each class
  for (const req of classRequirements) {
    const { subject, faculty: assignedFaculty } = req;
    
    while (req.remaining > 0) {
      let bestSlot: { day: WeekDay; slot: TimeSlot; classroom: Classroom; score: number } | null = null;
      
      // Try to distribute evenly across days
      const dayCounts = new Map<WeekDay, number>();
      workingDays.forEach(day => {
        const count = entries.filter(e => e.subjectId === subject.id && e.day === day).length;
        dayCounts.set(day, count);
      });
      
      // Sort days by count (prefer days with fewer classes of this subject)
      const sortedDays = [...workingDays].sort((a, b) => 
        (dayCounts.get(a) || 0) - (dayCounts.get(b) || 0)
      );
      
      for (const day of sortedDays) {
        // Check faculty max hours
        const facultyHours = facultyDayHours.get(assignedFaculty.id)!.get(day) || 0;
        if (facultyHours >= assignedFaculty.maxHoursPerDay) continue;
        
        for (const slot of dailySlots) {
          // Check faculty availability
          if (!isFacultyAvailable(assignedFaculty, day, slot)) continue;
          
          // Check faculty not already scheduled
          const slotKey = `${slot.start}-${slot.end}`;
          if (facultySchedule.get(assignedFaculty.id)!.get(day)!.get(slotKey)) continue;
          
          // Find available classroom
          for (const classroom of classrooms) {
            if (classroomSchedule.get(classroom.id)!.get(day)!.get(slotKey)) continue;
            
            // Calculate score
            const existingDayEntries = entries.filter(e => e.day === day);
            const score = calculateSlotScore(slot, subject, preferences, existingDayEntries, subjects);
            
            // Add bonus for even distribution
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
        const entry: ScheduleEntry = {
          id: generateId(),
          subjectId: subject.id,
          facultyId: assignedFaculty.id,
          classroomId: bestSlot.classroom.id,
          day: bestSlot.day,
          timeSlot: bestSlot.slot,
        };
        
        entries.push(entry);
        
        // Update tracking
        const slotKey = `${bestSlot.slot.start}-${bestSlot.slot.end}`;
        facultySchedule.get(assignedFaculty.id)!.get(bestSlot.day)!.set(slotKey, true);
        classroomSchedule.get(bestSlot.classroom.id)!.get(bestSlot.day)!.set(slotKey, true);
        
        const currentHours = facultyDayHours.get(assignedFaculty.id)!.get(bestSlot.day) || 0;
        facultyDayHours.get(assignedFaculty.id)!.set(bestSlot.day, currentHours + 1);
        
        req.remaining--;
      } else {
        // Could not schedule - add conflict
        conflicts.push({
          type: 'availability',
          description: `Could not schedule ${subject.name} - no available slots`,
          entries: [],
        });
        break;
      }
    }
  }
  
  // Calculate overall score
  const maxPossible = subjects.reduce((acc, s) => acc + s.hoursPerWeek, 0);
  const scheduled = entries.length;
  const score = (scheduled / maxPossible) * 100;
  
  return { entries, conflicts, score };
};

// Calculate scheduler statistics
export const calculateStats = (
  entries: ScheduleEntry[],
  config: SchedulerConfig
): SchedulerStats => {
  const { subjects, faculty, classrooms, workingDays, dailySlots } = config;
  
  const totalPossibleClasses = subjects.reduce((acc, s) => acc + s.hoursPerWeek, 0);
  const totalClasses = entries.length;
  
  // Faculty utilization
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
  
  // Classroom utilization
  const totalClassroomSlots = classrooms.length * workingDays.length * dailySlots.length;
  const classroomUtilization = (entries.length / totalClassroomSlots) * 100;
  
  // Preference score (simplified)
  const preferenceScore = totalClasses >= totalPossibleClasses ? 100 : (totalClasses / totalPossibleClasses) * 100;
  
  return {
    totalClasses,
    facultyUtilization: Math.round(facultyUtilization * 10) / 10,
    classroomUtilization: Math.round(classroomUtilization * 10) / 10,
    preferenceScore: Math.round(preferenceScore * 10) / 10,
  };
};

// Validate timetable for conflicts
export const validateTimetable = (
  entries: ScheduleEntry[],
  faculty: Faculty[],
  classrooms: Classroom[]
): Conflict[] => {
  const conflicts: Conflict[] = [];
  
  // Check for faculty overlaps
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const e1 = entries[i];
      const e2 = entries[j];
      
      if (e1.day !== e2.day) continue;
      if (!slotsOverlap(e1.timeSlot, e2.timeSlot)) continue;
      
      // Same faculty at same time
      if (e1.facultyId === e2.facultyId) {
        conflicts.push({
          type: 'faculty_overlap',
          description: 'Faculty assigned to multiple classes at the same time',
          entries: [e1.id, e2.id],
        });
      }
      
      // Same classroom at same time
      if (e1.classroomId === e2.classroomId) {
        conflicts.push({
          type: 'classroom_overlap',
          description: 'Classroom double-booked',
          entries: [e1.id, e2.id],
        });
      }
    }
  }
  
  return conflicts;
};
