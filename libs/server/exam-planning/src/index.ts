// Modulo NestJS (usato da apps/api)
export * from './lib/exam-planning.module';

// Entità TypeORM
export * from './lib/degree-courses/degree-course.entity';
export * from './lib/subjects/subject.entity';
export * from './lib/exam-sessions/exam-sessions.entity';
export * from './lib/exams/exam.entity';
export * from './lib/teachers/teacher.entity';
export * from './lib/secretariats/secretariat.entity';

// DTO (Create / Update)
export * from './lib/degree-courses/dto/create-degree-course.dto';
export * from './lib/degree-courses/dto/update-degree-course.dto';
export * from './lib/subjects/dto/create-subject.dto';
export * from './lib/subjects/dto/update-subject.dto';
export * from './lib/exam-sessions/dto/create-exam-session.dto';
export * from './lib/exam-sessions/dto/update-exam-session.dto';
export * from './lib/exams/dto/create-exam.dto';
export * from './lib/exams/dto/update-exam.dto';
export * from './lib/teachers/dto/create-teacher.dto';
export * from './lib/teachers/dto/update-teacher.dto';
export * from './lib/secretariats/dto/create-secretariat.dto';
export * from './lib/secretariats/dto/update-secretariat.dto';

// Enum
export * from './lib/exams/dto/exam-type.enum';
export * from './lib/exams/dto/room-type.enum';

// Interfacce "list item" (forma piatta esposta al frontend)
export * from './lib/degree-courses/interfaces/degree-course-list-item.interface';
export * from './lib/subjects/interfaces/subject-list-item.interface';
export * from './lib/exam-sessions/interfaces/exam-session-list-item.interface';
export * from './lib/exams/interfaces/exam-list-item.interface';
export * from './lib/teachers/interfaces/teacher-list-item.interface';
export * from './lib/secretariats/interfaces/secretariat-list-item.interface';
