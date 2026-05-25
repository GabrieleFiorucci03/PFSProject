// Forma "piatta" della sessione d'esame esposta al frontend.
// Le date sono stringhe ISO (YYYY-MM-DD) come serializzate nel JSON.
export interface ExamSessionListItem {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    planningStartDate: string;
    planningEndDate: string;
}
