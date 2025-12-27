import { Subject, Faculty, Classroom, TimeSlot, WeekDay, StudentPreferences } from '@/types/scheduler';

// Dummy subjects
export const dummySubjects: Subject[] = [
  { id: 's1', name: 'Mathematics', code: 'MATH101', color: 'math', hoursPerWeek: 5, difficulty: 'hard' },
  { id: 's2', name: 'Physics', code: 'PHY101', color: 'physics', hoursPerWeek: 4, difficulty: 'hard' },
  { id: 's3', name: 'Chemistry', code: 'CHEM101', color: 'chemistry', hoursPerWeek: 4, difficulty: 'medium' },
  { id: 's4', name: 'Biology', code: 'BIO101', color: 'biology', hoursPerWeek: 3, difficulty: 'medium' },
  { id: 's5', name: 'English', code: 'ENG101', color: 'english', hoursPerWeek: 4, difficulty: 'easy' },
  { id: 's6', name: 'History', code: 'HIST101', color: 'history', hoursPerWeek: 3, difficulty: 'easy' },
  { id: 's7', name: 'Computer Science', code: 'CS101', color: 'computer', hoursPerWeek: 4, difficulty: 'medium' },
  { id: 's8', name: 'Geography', code: 'GEO101', color: 'geography', hoursPerWeek: 2, difficulty: 'easy' },
];

// Dummy faculty
export const dummyFaculty: Faculty[] = [
  {
    id: 'f1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.j@college.edu',
    subjects: ['s1'],
    maxHoursPerDay: 6,
    availability: {
      monday: [{ start: '08:00', end: '16:00' }],
      tuesday: [{ start: '08:00', end: '14:00' }],
      wednesday: [{ start: '08:00', end: '16:00' }],
      thursday: [{ start: '10:00', end: '16:00' }],
      friday: [{ start: '08:00', end: '14:00' }],
    },
  },
  {
    id: 'f2',
    name: 'Prof. Michael Chen',
    email: 'michael.c@college.edu',
    subjects: ['s2', 's7'],
    maxHoursPerDay: 5,
    availability: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '09:00', end: '13:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '15:00' }],
    },
  },
  {
    id: 'f3',
    name: 'Dr. Emily Davis',
    email: 'emily.d@college.edu',
    subjects: ['s3'],
    maxHoursPerDay: 6,
    availability: {
      monday: [{ start: '08:00', end: '15:00' }],
      tuesday: [{ start: '08:00', end: '15:00' }],
      wednesday: [{ start: '08:00', end: '15:00' }],
      thursday: [{ start: '08:00', end: '15:00' }],
      friday: [{ start: '08:00', end: '12:00' }],
    },
  },
  {
    id: 'f4',
    name: 'Prof. James Wilson',
    email: 'james.w@college.edu',
    subjects: ['s4', 's8'],
    maxHoursPerDay: 5,
    availability: {
      monday: [{ start: '10:00', end: '18:00' }],
      tuesday: [{ start: '10:00', end: '16:00' }],
      wednesday: [{ start: '10:00', end: '18:00' }],
      thursday: [{ start: '10:00', end: '18:00' }],
      friday: [{ start: '10:00', end: '14:00' }],
    },
  },
  {
    id: 'f5',
    name: 'Dr. Lisa Anderson',
    email: 'lisa.a@college.edu',
    subjects: ['s5', 's6'],
    maxHoursPerDay: 6,
    availability: {
      monday: [{ start: '08:00', end: '16:00' }],
      tuesday: [{ start: '08:00', end: '16:00' }],
      wednesday: [{ start: '08:00', end: '16:00' }],
      thursday: [{ start: '08:00', end: '16:00' }],
      friday: [{ start: '08:00', end: '14:00' }],
    },
  },
];

// Dummy classrooms
export const dummyClassrooms: Classroom[] = [
  { id: 'c1', name: 'Room 101', capacity: 40, type: 'lecture' },
  { id: 'c2', name: 'Room 102', capacity: 40, type: 'lecture' },
  { id: 'c3', name: 'Room 103', capacity: 30, type: 'seminar' },
  { id: 'c4', name: 'Lab A', capacity: 25, type: 'lab' },
  { id: 'c5', name: 'Lab B', capacity: 25, type: 'lab' },
  { id: 'c6', name: 'Room 201', capacity: 50, type: 'lecture' },
];

// Default time slots (1-hour classes)
export const defaultTimeSlots: TimeSlot[] = [
  { start: '08:00', end: '09:00' },
  { start: '09:00', end: '10:00' },
  { start: '10:00', end: '11:00' },
  { start: '11:00', end: '12:00' },
  { start: '12:00', end: '13:00' },
  { start: '14:00', end: '15:00' },
  { start: '15:00', end: '16:00' },
  { start: '16:00', end: '17:00' },
];

// Default working days
export const defaultWorkingDays: WeekDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

// Default student preferences
export const defaultPreferences: StudentPreferences = {
  preferMorning: true,
  preferEvenDistribution: true,
  avoidDifficultConsecutive: true,
};

// Color mapping for subjects
export const subjectColorClasses: Record<string, { bg: string; text: string; border: string }> = {
  math: { bg: 'bg-subject-math/15', text: 'text-subject-math', border: 'border-subject-math/30' },
  physics: { bg: 'bg-subject-physics/15', text: 'text-subject-physics', border: 'border-subject-physics/30' },
  chemistry: { bg: 'bg-subject-chemistry/15', text: 'text-subject-chemistry', border: 'border-subject-chemistry/30' },
  biology: { bg: 'bg-subject-biology/15', text: 'text-subject-biology', border: 'border-subject-biology/30' },
  english: { bg: 'bg-subject-english/15', text: 'text-subject-english', border: 'border-subject-english/30' },
  history: { bg: 'bg-subject-history/15', text: 'text-subject-history', border: 'border-subject-history/30' },
  geography: { bg: 'bg-subject-geography/15', text: 'text-subject-geography', border: 'border-subject-geography/30' },
  computer: { bg: 'bg-subject-computer/15', text: 'text-subject-computer', border: 'border-subject-computer/30' },
};
