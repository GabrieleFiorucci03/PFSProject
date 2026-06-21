// Forma "piatta" della materia esposta al frontend.
// Le FK (corso di laurea, docente) sono annidate come {id, name}:
// l'id serve ai form di edit, il name alla tabella.
export interface SubjectListItem {
    id: number;
    name: string;
    year: number;
    cfu: number;
    degreeCourse: {
        id: number;
        name: string;
        department: string;
    };
    teacher: {
        id: number;
        name: string;
    };
}
