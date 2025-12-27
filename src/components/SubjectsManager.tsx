import { Plus, Trash2, BookOpen } from 'lucide-react';
import { Subject, SubjectColor } from '@/types/scheduler';
import { subjectColorClasses } from '@/data/dummyData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SubjectsManagerProps {
  subjects: Subject[];
  onAdd: (subject: Subject) => void;
  onRemove: (id: string) => void;
}

const difficultyBadge = {
  easy: 'bg-success/10 text-success',
  medium: 'bg-warning/10 text-warning',
  hard: 'bg-destructive/10 text-destructive',
};

export const SubjectsManager = ({ subjects, onRemove }: SubjectsManagerProps) => {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Subjects</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your curriculum subjects and their properties
          </p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add Subject
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject, index) => {
          const colors = subjectColorClasses[subject.color] || subjectColorClasses.math;
          
          return (
            <div
              key={subject.id}
              className={cn(
                "bg-card rounded-xl border border-border p-4 group hover:shadow-card transition-all duration-200 animate-slide-up"
              )}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  colors.bg
                )}>
                  <BookOpen className={cn("w-5 h-5", colors.text)} />
                </div>
                <button
                  onClick={() => onRemove(subject.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>

              <h3 className="font-semibold text-foreground mb-1">{subject.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{subject.code}</p>

              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full capitalize",
                  difficultyBadge[subject.difficulty]
                )}>
                  {subject.difficulty}
                </span>
                <span className="text-xs text-muted-foreground">
                  {subject.hoursPerWeek}h/week
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
