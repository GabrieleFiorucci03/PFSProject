import { ExamType } from '../dto/exam-type.enum';
import { RoomType } from '../dto/room-type.enum';

// Forma "piatta" dell'esame esposta al frontend.
// date è stringa ISO (YYYY-MM-DD); le tre FK sono annidate come {id, name}.
export interface ExamListItem {
    id: number;
    date: string;
    startHour: number;
    endHour: number;
    roomType: RoomType;
    type: ExamType;
    subject: {
        id: number;
        name: string;
    };
    examSession: {
        id: number;
        name: string;
    };
    teacher: {
        id: number;
        name: string;
    };
}
