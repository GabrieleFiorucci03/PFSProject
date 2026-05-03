import { Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity }  from '@server/users';
import { SubjectEntity } from '../subjects/subject.entity';
import { ExamEntity } from '../exams/exam.entity';


@Entity('teachers')
export class TeacherEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => UserEntity, {eager: true, nullable: false, onDelete: 'CASCADE'})
    @JoinColumn()
    user: UserEntity;

    @OneToMany(() => SubjectEntity, (subject) => subject.teacher)
    subjects: SubjectEntity[];

    @OneToMany(() => ExamEntity, (exam) => exam.teacher)
    exams: ExamEntity[];
}

