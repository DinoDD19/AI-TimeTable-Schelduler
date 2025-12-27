import { useState, useCallback } from 'react';
import { 
  Subject, 
  Faculty, 
  Classroom, 
  TimeSlot, 
  WeekDay, 
  StudentPreferences,
  ScheduleEntry,
  GeneratedTimetable,
  SchedulerStats
} from '@/types/scheduler';
import { 
  dummySubjects, 
  dummyFaculty, 
  dummyClassrooms, 
  defaultTimeSlots, 
  defaultWorkingDays,
  defaultPreferences 
} from '@/data/dummyData';
import { generateTimetable, calculateStats, validateTimetable } from '@/lib/scheduler';

export const useScheduler = () => {
  const [subjects, setSubjects] = useState<Subject[]>(dummySubjects);
  const [faculty, setFaculty] = useState<Faculty[]>(dummyFaculty);
  const [classrooms, setClassrooms] = useState<Classroom[]>(dummyClassrooms);
  const [preferences, setPreferences] = useState<StudentPreferences>(defaultPreferences);
  const [workingDays] = useState<WeekDay[]>(defaultWorkingDays);
  const [dailySlots] = useState<TimeSlot[]>(defaultTimeSlots);
  const [timetable, setTimetable] = useState<GeneratedTimetable | null>(null);
  const [stats, setStats] = useState<SchedulerStats | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = useCallback(() => {
    setIsGenerating(true);
    
    // Simulate async operation for UX
    setTimeout(() => {
      const config = {
        subjects,
        faculty,
        classrooms,
        preferences,
        workingDays,
        dailySlots,
      };
      
      const result = generateTimetable(config);
      const calculatedStats = calculateStats(result.entries, config);
      
      setTimetable(result);
      setStats(calculatedStats);
      setIsGenerating(false);
    }, 800);
  }, [subjects, faculty, classrooms, preferences, workingDays, dailySlots]);

  const updateEntry = useCallback((entryId: string, updates: Partial<ScheduleEntry>) => {
    if (!timetable) return;
    
    const updatedEntries = timetable.entries.map(entry =>
      entry.id === entryId ? { ...entry, ...updates } : entry
    );
    
    const conflicts = validateTimetable(updatedEntries, faculty, classrooms);
    
    setTimetable({
      ...timetable,
      entries: updatedEntries,
      conflicts,
    });
  }, [timetable, faculty, classrooms]);

  const deleteEntry = useCallback((entryId: string) => {
    if (!timetable) return;
    
    const updatedEntries = timetable.entries.filter(entry => entry.id !== entryId);
    const conflicts = validateTimetable(updatedEntries, faculty, classrooms);
    
    setTimetable({
      ...timetable,
      entries: updatedEntries,
      conflicts,
    });
    
    // Recalculate stats
    const config = { subjects, faculty, classrooms, preferences, workingDays, dailySlots };
    setStats(calculateStats(updatedEntries, config));
  }, [timetable, subjects, faculty, classrooms, preferences, workingDays, dailySlots]);

  const addSubject = useCallback((subject: Subject) => {
    setSubjects(prev => [...prev, subject]);
  }, []);

  const removeSubject = useCallback((subjectId: string) => {
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
  }, []);

  const addFaculty = useCallback((member: Faculty) => {
    setFaculty(prev => [...prev, member]);
  }, []);

  const removeFaculty = useCallback((facultyId: string) => {
    setFaculty(prev => prev.filter(f => f.id !== facultyId));
  }, []);

  const addClassroom = useCallback((classroom: Classroom) => {
    setClassrooms(prev => [...prev, classroom]);
  }, []);

  const removeClassroom = useCallback((classroomId: string) => {
    setClassrooms(prev => prev.filter(c => c.id !== classroomId));
  }, []);

  const updatePreferences = useCallback((newPrefs: Partial<StudentPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
  }, []);

  const clearTimetable = useCallback(() => {
    setTimetable(null);
    setStats(null);
  }, []);

  return {
    // Data
    subjects,
    faculty,
    classrooms,
    preferences,
    workingDays,
    dailySlots,
    timetable,
    stats,
    isGenerating,
    
    // Actions
    generate,
    updateEntry,
    deleteEntry,
    addSubject,
    removeSubject,
    addFaculty,
    removeFaculty,
    addClassroom,
    removeClassroom,
    updatePreferences,
    clearTimetable,
  };
};
