import { Plus, Trash2, Mail, Clock } from 'lucide-react';
import { Faculty, Subject } from '@/types/scheduler';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FacultyManagerProps {
  faculty: Faculty[];
  subjects: Subject[];
  onAdd: (member: Faculty) => void;
  onRemove: (id: string) => void;
}

export const FacultyManager = ({ faculty, subjects, onRemove }: FacultyManagerProps) => {
  const getSubjectNames = (subjectIds: string[]) => {
    return subjectIds
      .map(id => subjects.find(s => s.id === id)?.code)
      .filter(Boolean)
      .join(', ');
  };

  const getAvailableDays = (member: Faculty) => {
    return Object.keys(member.availability).length;
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Faculty</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage faculty members and their availability
          </p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add Faculty
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary/50">
              <th className="text-left p-4 text-sm font-medium text-foreground">Name</th>
              <th className="text-left p-4 text-sm font-medium text-foreground">Email</th>
              <th className="text-left p-4 text-sm font-medium text-foreground">Subjects</th>
              <th className="text-left p-4 text-sm font-medium text-foreground">Availability</th>
              <th className="text-left p-4 text-sm font-medium text-foreground">Max Hours</th>
              <th className="w-12 p-4"></th>
            </tr>
          </thead>
          <tbody>
            {faculty.map((member, index) => (
              <tr 
                key={member.id} 
                className={cn(
                  "border-t border-border hover:bg-secondary/30 transition-colors animate-slide-up"
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-foreground">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <span className="font-medium text-foreground">{member.name}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{member.email}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-muted-foreground">
                    {getSubjectNames(member.subjects) || '-'}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-sm px-2 py-1 rounded-full bg-success/10 text-success">
                    {getAvailableDays(member)} days
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{member.maxHoursPerDay}h/day</span>
                  </div>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => onRemove(member.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
