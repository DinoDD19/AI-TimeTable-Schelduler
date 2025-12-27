// Core types for the timetable scheduler

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: SubjectColor;
  hoursPerWeek: number;
  difficulty: 'easy' | 'medium' | 'hard';
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
  subjects: string[]; // Subject IDs
  availability: Availability;
  maxHoursPerDay: number;
}

export interface Availability {
  [day: string]: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:MM format
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

export interface TimetableConfig {
  subjects: Subject[];
  faculty: Faculty[];
  classrooms: Classroom[];
  preferences: StudentPreferences;
  workingDays: WeekDay[];
  dailySlots: TimeSlot[];
}

export interface GeneratedTimetable {
  entries: ScheduleEntry[];
  conflicts: Conflict[];
  score: number;
}

export interface Conflict {
  type: 'faculty_overlap' | 'classroom_overlap' | 'availability' | 'capacity';
  description: string;
  entries: string[]; // Entry IDs involved
}

export interface SchedulerStats {
  totalClasses: number;
  facultyUtilization: number;
  classroomUtilization: number;
  preferenceScore: number;
}
