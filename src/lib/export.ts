import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EnhancedScheduleEntry, Subject, Faculty, Classroom, WeekDay, TimeSlot } from '@/types/scheduler';

interface ExportData {
  entries: EnhancedScheduleEntry[];
  subjects: Subject[];
  faculty: Faculty[];
  classrooms: Classroom[];
  workingDays: WeekDay[];
  dailySlots: TimeSlot[];
}

const dayLabels: Record<WeekDay, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
};

/**
 * Export timetable to PDF format
 */
export const exportToPDF = (data: ExportData, title = 'Weekly Timetable') => {
  const { entries, subjects, faculty, classrooms, workingDays, dailySlots } = data;
  
  const doc = new jsPDF('landscape');
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246); // Primary color
  doc.text(title, 14, 22);
  
  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Prepare table data
  const tableHead = ['Time', ...workingDays.map(d => dayLabels[d])];
  
  const tableBody = dailySlots.map(slot => {
    const row = [`${slot.start} - ${slot.end}`];
    
    workingDays.forEach(day => {
      const entry = entries.find(
        e => e.day === day && e.timeSlot.start === slot.start
      );
      
      if (entry) {
        const subject = subjects.find(s => s.id === entry.subjectId);
        const facultyMember = faculty.find(f => f.id === entry.facultyId);
        const classroom = classrooms.find(c => c.id === entry.classroomId);
        
        row.push(
          `${subject?.code || ''}\n${facultyMember?.name.split(' ')[1] || ''}\n${classroom?.name || ''}`
        );
      } else {
        row.push('-');
      }
    });
    
    return row;
  });
  
  // Generate table
  autoTable(doc, {
    head: [tableHead],
    body: tableBody,
    startY: 40,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 25, fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });
  
  // Add legend
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Legend:', 14, finalY);
  
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  
  const legendItems = [
    '📐 Hard difficulty subjects are scheduled in morning slots',
    '📊 Classes are distributed evenly across the week',
    '🔒 Locked slots cannot be changed automatically',
  ];
  
  legendItems.forEach((item, index) => {
    doc.text(item, 14, finalY + 8 + (index * 6));
  });
  
  // Save
  doc.save(`timetable-${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Export timetable to CSV format
 */
export const exportToCSV = (data: ExportData, title = 'timetable') => {
  const { entries, subjects, faculty, classrooms, workingDays, dailySlots } = data;
  
  // Header row
  const headers = ['Time', ...workingDays.map(d => dayLabels[d])];
  
  // Data rows
  const rows = dailySlots.map(slot => {
    const row = [`${slot.start} - ${slot.end}`];
    
    workingDays.forEach(day => {
      const entry = entries.find(
        e => e.day === day && e.timeSlot.start === slot.start
      );
      
      if (entry) {
        const subject = subjects.find(s => s.id === entry.subjectId);
        const facultyMember = faculty.find(f => f.id === entry.facultyId);
        const classroom = classrooms.find(c => c.id === entry.classroomId);
        
        row.push(
          `${subject?.code || ''} | ${facultyMember?.name || ''} | ${classroom?.name || ''}`
        );
      } else {
        row.push('');
      }
    });
    
    return row;
  });
  
  // Convert to CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  // Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${title}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
