import { useState, useCallback } from 'react';
import { 
  Subject, 
  Faculty, 
  Classroom, 
  TimeSlot, 
  WeekDay, 
  StudentPreferences,
  EnhancedScheduleEntry,
  GeneratedTimetable,
  SchedulerStats,
  UserRole,
  ViewMode,
  SlotState
} from '@/types/scheduler';
import { 
  dummySubjects, 
  dummyFaculty, 
  dummyClassrooms, 
  defaultTimeSlots, 
  defaultWorkingDays,
  defaultPreferences 
} from '@/data/dummyData';
import { generateTimetable, calculateStats, validateTimetable, checkMoveConflicts } from '@/lib/scheduler';
import { useUndoRedo } from './useUndoRedo';

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
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [selectedDay, setSelectedDay] = useState<WeekDay>('monday');

  // Undo/redo functionality
  const { 
    pushState, 
    undo: undoHistory, 
    redo: redoHistory, 
    canUndo, 
    canRedo,
    previousAction,
    nextAction 
  } = useUndoRedo();

  const generate = useCallback(() => {
    setIsGenerating(true);
    
    // Simulate async operation for smooth UX
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
      
      // Push initial state to history
      pushState(result.entries, 'generate', 'Generated new timetable');
    }, 1200); // Longer for animation effect
  }, [subjects, faculty, classrooms, preferences, workingDays, dailySlots, pushState]);

  const updateEntry = useCallback((entryId: string, updates: Partial<EnhancedScheduleEntry>) => {
    if (!timetable) return;
    
    const updatedEntries = timetable.entries.map(entry =>
      entry.id === entryId ? { ...entry, ...updates } : entry
    );
    
    const conflicts = validateTimetable(updatedEntries, faculty, classrooms);
    
    // Mark entries with conflicts
    const entriesWithConflicts = updatedEntries.map(entry => ({
      ...entry,
      slotState: {
        ...entry.slotState,
        hasConflict: conflicts.some(c => c.entries.includes(entry.id)),
        conflictReason: conflicts.find(c => c.entries.includes(entry.id))?.description,
      },
    }));
    
    setTimetable({
      ...timetable,
      entries: entriesWithConflicts,
      conflicts,
    });
    
    pushState(entriesWithConflicts, 'update', 'Updated class slot');
  }, [timetable, faculty, classrooms, pushState]);

  const moveEntry = useCallback((
    entryId: string, 
    newDay: WeekDay, 
    newSlot: TimeSlot,
    newClassroomId?: string
  ) => {
    if (!timetable) return { success: false, conflicts: [] };
    
    const entry = timetable.entries.find(e => e.id === entryId);
    if (!entry) return { success: false, conflicts: [] };
    
    // Check for conflicts before moving
    const moveConflicts = checkMoveConflicts(
      entry,
      newDay,
      newSlot,
      newClassroomId || entry.classroomId,
      timetable.entries,
      faculty
    );
    
    if (moveConflicts.length > 0) {
      return { success: false, conflicts: moveConflicts };
    }
    
    // Proceed with move
    const updatedEntries = timetable.entries.map(e =>
      e.id === entryId 
        ? { 
            ...e, 
            day: newDay, 
            timeSlot: newSlot,
            classroomId: newClassroomId || e.classroomId,
            aiReason: '✋ Manually moved by user',
          } 
        : e
    );
    
    setTimetable({
      ...timetable,
      entries: updatedEntries,
    });
    
    const config = { subjects, faculty, classrooms, preferences, workingDays, dailySlots };
    setStats(calculateStats(updatedEntries, config));
    
    pushState(updatedEntries, 'move', 'Moved class to new slot');
    
    return { success: true, conflicts: [] };
  }, [timetable, faculty, subjects, classrooms, preferences, workingDays, dailySlots, pushState]);

  const toggleSlotState = useCallback((
    entryId: string, 
    stateKey: keyof SlotState
  ) => {
    if (!timetable) return;
    
    const updatedEntries = timetable.entries.map(entry =>
      entry.id === entryId 
        ? { 
            ...entry, 
            slotState: { 
              ...entry.slotState, 
              [stateKey]: !entry.slotState[stateKey] 
            } 
          } 
        : entry
    );
    
    setTimetable({
      ...timetable,
      entries: updatedEntries,
    });
    
    pushState(updatedEntries, 'toggle', `Toggled ${stateKey} state`);
  }, [timetable, pushState]);

  const deleteEntry = useCallback((entryId: string) => {
    if (!timetable) return;
    
    const updatedEntries = timetable.entries.filter(entry => entry.id !== entryId);
    const conflicts = validateTimetable(updatedEntries, faculty, classrooms);
    
    setTimetable({
      ...timetable,
      entries: updatedEntries,
      conflicts,
    });
    
    const config = { subjects, faculty, classrooms, preferences, workingDays, dailySlots };
    setStats(calculateStats(updatedEntries, config));
    
    pushState(updatedEntries, 'delete', 'Deleted class');
  }, [timetable, subjects, faculty, classrooms, preferences, workingDays, dailySlots, pushState]);

  const undo = useCallback(() => {
    const previousEntries = undoHistory();
    if (previousEntries && timetable) {
      setTimetable({
        ...timetable,
        entries: previousEntries,
      });
      const config = { subjects, faculty, classrooms, preferences, workingDays, dailySlots };
      setStats(calculateStats(previousEntries, config));
    }
  }, [undoHistory, timetable, subjects, faculty, classrooms, preferences, workingDays, dailySlots]);

  const redo = useCallback(() => {
    const nextEntries = redoHistory();
    if (nextEntries && timetable) {
      setTimetable({
        ...timetable,
        entries: nextEntries,
      });
      const config = { subjects, faculty, classrooms, preferences, workingDays, dailySlots };
      setStats(calculateStats(nextEntries, config));
    }
  }, [redoHistory, timetable, subjects, faculty, classrooms, preferences, workingDays, dailySlots]);

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
    userRole,
    viewMode,
    selectedDay,
    
    // Undo/redo
    canUndo,
    canRedo,
    previousAction,
    nextAction,
    undo,
    redo,
    
    // Actions
    generate,
    updateEntry,
    moveEntry,
    toggleSlotState,
    deleteEntry,
    addSubject,
    removeSubject,
    addFaculty,
    removeFaculty,
    addClassroom,
    removeClassroom,
    updatePreferences,
    clearTimetable,
    setUserRole,
    setViewMode,
    setSelectedDay,
  };
};
