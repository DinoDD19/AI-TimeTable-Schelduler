// Enhanced types for the timetable scheduler with UX features

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: SubjectColor;
  hoursPerWeek: number;
  difficulty: 'easy' | 'medium' | 'hard';
  icon?: string; // Emoji icon for the subject
}

export type SubjectColor = 
  | 'math' 
  | 'physics' 
  | 'chemistry' 
  | 'biology' 
  | 'english' 
  | 'history' 
  | 'geography' 
  | 'computer';

export interface Faculty {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  availability: Availability;
  maxHoursPerDay: number;
  workload?: number; // Current workload percentage
}

export interface Availability {
  [day: string]: TimeSlot[];
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  type: 'lecture' | 'lab' | 'seminar';
}

export interface StudentPreferences {
  preferMorning: boolean;
  preferEvenDistribution: boolean;
  avoidDifficultConsecutive: boolean;
}

export interface ScheduleEntry {
  id: string;
  subjectId: string;
  facultyId: string;
  classroomId: string;
  day: WeekDay;
  timeSlot: TimeSlot;
}

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

// Enhanced slot state for UX features
export interface SlotState {
  isLocked: boolean;      // User locked this slot
  isPreferred: boolean;   // User prefers this slot
  isAvoided: boolean;     // User wants to avoid this slot
  hasConflict: boolean;   // There's a scheduling conflict
  conflictReason?: string;
}

// Enhanced schedule entry with slot state
export interface EnhancedScheduleEntry extends ScheduleEntry {
  slotState: SlotState;
  aiReason?: string; // Why AI chose this slot
}

export interface TimetableConfig {
  subjects: Subject[];
  faculty: Faculty[];
  classrooms: Classroom[];
  preferences: StudentPreferences;
  workingDays: WeekDay[];
  dailySlots: TimeSlot[];
}

export interface GeneratedTimetable {
  entries: EnhancedScheduleEntry[];
  conflicts: Conflict[];
  score: number;
  aiInsights: AIInsight[];
}

export interface Conflict {
  type: 'faculty_overlap' | 'classroom_overlap' | 'availability' | 'capacity' | 'preference_violation';
  description: string;
  entries: string[];
  severity: 'warning' | 'error';
}

// AI insights for explaining scheduling decisions
export interface AIInsight {
  id: string;
  type: 'suggestion' | 'explanation' | 'warning';
  message: string;
  relatedEntryId?: string;
  icon: string;
}

export interface SchedulerStats {
  totalClasses: number;
  facultyUtilization: number;
  classroomUtilization: number;
  preferenceScore: number;
  conflictCount: number;
}

// User roles for different views
export type UserRole = 'student' | 'faculty' | 'admin';

// View modes
export type ViewMode = 'daily' | 'weekly' | 'calendar';

// Undo/redo history item
export interface HistoryItem {
  id: string;
  timestamp: number;
  action: string;
  entries: EnhancedScheduleEntry[];
  description: string;
}

// Drag and drop types
export interface DragItem {
  type: 'subject' | 'entry';
  id: string;
  sourceDay?: WeekDay;
  sourceSlot?: TimeSlot;
}

export interface DropResult {
  day: WeekDay;
  slot: TimeSlot;
  classroomId: string;
}
