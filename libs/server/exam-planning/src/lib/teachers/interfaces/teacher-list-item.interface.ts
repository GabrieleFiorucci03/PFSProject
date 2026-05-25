// Forma "piatta" del docente esposta al frontend.
// name ed email derivano dallo User collegato; la passwordHash NON viene mai esposta.
export interface TeacherListItem {
    id: number;
    name: string;
    email: string;
}
