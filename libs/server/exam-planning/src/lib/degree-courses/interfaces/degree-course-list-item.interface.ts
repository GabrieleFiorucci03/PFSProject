// Forma "piatta" del corso di laurea esposta al frontend.
// Deriva da DegreeCourseEntity ma espone solo i campi utili alla UI.
export interface DegreeCourseListItem {
    id: number;
    name: string;
    yearsDuration: number;
    department: string;
}
