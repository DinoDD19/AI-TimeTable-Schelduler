import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { TimetableGrid } from '@/components/TimetableGrid';
import { StatsCards } from '@/components/StatsCards';
import { EmptyState } from '@/components/EmptyState';
import { SubjectsManager } from '@/components/SubjectsManager';
import { FacultyManager } from '@/components/FacultyManager';
import { SettingsPanel } from '@/components/SettingsPanel';
import { useScheduler } from '@/hooks/useScheduler';

const Index = () => {
  const [activeTab, setActiveTab] = useState('timetable');
  
  const {
    subjects,
    faculty,
    classrooms,
    preferences,
    workingDays,
    dailySlots,
    timetable,
    stats,
    isGenerating,
    generate,
    updateEntry,
    deleteEntry,
    addSubject,
    removeSubject,
    addFaculty,
    removeFaculty,
    updatePreferences,
    clearTimetable,
  } = useScheduler();

  const renderContent = () => {
    switch (activeTab) {
      case 'subjects':
        return (
          <SubjectsManager
            subjects={subjects}
            onAdd={addSubject}
            onRemove={removeSubject}
          />
        );
      
      case 'faculty':
        return (
          <FacultyManager
            faculty={faculty}
            subjects={subjects}
            onAdd={addFaculty}
            onRemove={removeFaculty}
          />
        );
      
      case 'settings':
        return (
          <SettingsPanel
            preferences={preferences}
            onUpdate={updatePreferences}
          />
        );
      
      case 'timetable':
      default:
        return (
          <>
            <StatsCards stats={stats} />
            
            {timetable ? (
              <TimetableGrid
                entries={timetable.entries}
                subjects={subjects}
                faculty={faculty}
                classrooms={classrooms}
                workingDays={workingDays}
                dailySlots={dailySlots}
                onDeleteEntry={deleteEntry}
                onUpdateEntry={updateEntry}
              />
            ) : (
              <EmptyState onGenerate={generate} isGenerating={isGenerating} />
            )}
          </>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 flex flex-col">
        <Header
          onGenerate={generate}
          onClear={clearTimetable}
          isGenerating={isGenerating}
          stats={stats}
          conflicts={timetable?.conflicts || []}
        />
        
        <div className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
