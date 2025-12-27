import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, BookOpen, Settings, Sparkles, Undo2, Redo2, Download, Play, RefreshCw, User, GraduationCap, Shield  } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EnhancedTimetableGrid } from '@/components/EnhancedTimetableGrid';
import { AIInsightPanel } from '@/components/AIInsightPanel';
import { SubjectPalette } from '@/components/SubjectChip';
import { StatsCards } from '@/components/StatsCards';
import { SubjectsManager } from '@/components/SubjectsManager';
import { FacultyManager } from '@/components/FacultyManager';
import { SettingsPanel } from '@/components/SettingsPanel';
import { useScheduler } from '@/hooks/useScheduler';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { exportToPDF, exportToCSV } from '@/lib/export';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types/scheduler';

const roleIcons: Record<UserRole, typeof User> = {
  student: GraduationCap,
  faculty: User,
  admin: Shield,
};

const Index = () => {
  const [activeTab, setActiveTab] = useState('timetable');
  
  const {
    subjects, faculty, classrooms, preferences, workingDays, dailySlots,
    timetable, stats, isGenerating, userRole, viewMode,
    canUndo, canRedo, previousAction, nextAction,
    generate, moveEntry, toggleSlotState, deleteEntry,
    addSubject, removeSubject, addFaculty, removeFaculty,
    updatePreferences, clearTimetable, setUserRole, undo, redo,
  } = useScheduler();

  // Keyboard shortcuts
  useKeyboardNavigation({
    onUndo: undo,
    onRedo: redo,
    isEnabled: true,
  });

  const handleExport = (format: 'pdf' | 'csv') => {
    if (!timetable) return;
    const data = { entries: timetable.entries, subjects, faculty, classrooms, workingDays, dailySlots };
    format === 'pdf' ? exportToPDF(data) : exportToCSV(data);
  };

  const RoleIcon = roleIcons[userRole];

  return (
    <div className="min-h-screen bg-background">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow"
              >
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </motion.div>
              <div>
                <h1 className="font-bold text-lg text-foreground">EduScheduler</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Timetables</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Role Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <RoleIcon className="w-4 h-4" />
                    <span className="capitalize hidden sm:inline">{userRole}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {(['student', 'faculty', 'admin'] as UserRole[]).map(role => (
                    <DropdownMenuItem key={role} onClick={() => setUserRole(role)}>
                      <span className="capitalize">{role}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Undo/Redo */}
              <div className="flex border rounded-lg">
                <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} title={`Undo: ${previousAction || 'Nothing to undo'}`}>
                  <Undo2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} title={`Redo: ${nextAction || 'Nothing to redo'}`}>
                  <Redo2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Export */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" disabled={!timetable}>
                    <Download className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>📄 Export PDF</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('csv')}>📊 Export CSV</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Generate */}
              <Button onClick={generate} disabled={isGenerating} className="bg-gradient-primary hover:opacity-90 shadow-glow">
                {isGenerating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                {isGenerating ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="container mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-card border">
            <TabsTrigger value="timetable" className="gap-2"><Calendar className="w-4 h-4" /> Timetable</TabsTrigger>
            <TabsTrigger value="subjects" className="gap-2"><BookOpen className="w-4 h-4" /> Subjects</TabsTrigger>
            <TabsTrigger value="faculty" className="gap-2"><Users className="w-4 h-4" /> Faculty</TabsTrigger>
            <TabsTrigger value="settings" className="gap-2"><Settings className="w-4 h-4" /> Settings</TabsTrigger>
          </TabsList>
        </Tabs>

        <AnimatePresence mode="wait">
          {activeTab === 'timetable' && (
            <motion.div key="timetable" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <StatsCards stats={stats} />
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                  {timetable ? (
                    <EnhancedTimetableGrid
                      entries={timetable.entries}
                      subjects={subjects}
                      faculty={faculty}
                      classrooms={classrooms}
                      workingDays={workingDays}
                      dailySlots={dailySlots}
                      onMoveEntry={moveEntry}
                      onToggleSlotState={toggleSlotState}
                      onDeleteEntry={deleteEntry}
                    />
                  ) : (
                    <div className="bg-card rounded-xl border p-12 text-center">
                      <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="w-20 h-20 rounded-2xl bg-gradient-primary mx-auto mb-6 flex items-center justify-center shadow-glow">
                        <Calendar className="w-10 h-10 text-primary-foreground" />
                      </motion.div>
                      <h3 className="text-xl font-semibold mb-2">Ready to Generate</h3>
                      <p className="text-muted-foreground mb-6">Click "Generate" to create an optimized timetable</p>
                      <Button onClick={generate} className="bg-gradient-primary">
                        <Sparkles className="w-4 h-4 mr-2" /> Generate Optimal Schedule
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <AIInsightPanel insights={timetable?.aiInsights || []} conflicts={timetable?.conflicts || []} isGenerating={isGenerating} />
                  <SubjectPalette subjects={subjects} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'subjects' && (
            <motion.div key="subjects" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <SubjectsManager subjects={subjects} onAdd={addSubject} onRemove={removeSubject} />
            </motion.div>
          )}

          {activeTab === 'faculty' && (
            <motion.div key="faculty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <FacultyManager faculty={faculty} subjects={subjects} onAdd={addFaculty} onRemove={removeFaculty} />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <SettingsPanel preferences={preferences} onUpdate={updatePreferences} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
