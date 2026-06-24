import { Injectable } from "@nestjs/common";
import { DegreeCourseEntity } from "./degree-course.entity";
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDegreeCourseDto } from "./dto/create-degree-course.dto";
import { UpdateDegreeCourseDto } from "./dto/update-degree-course.dto";

/**
 * Repository CRUD dei corsi di laurea (solo accesso ai dati, nessuna eccezione
 * HTTP). Usa `find`/`findOne` così le relazioni `eager` restano caricate.
 */
@Injectable()
export class DegreeCoursesRepository {
    constructor(
        @InjectRepository(DegreeCourseEntity)
        private readonly repository: Repository<DegreeCourseEntity>
    ) {}

    /** Tutti i corsi, ordinati per nome. */
    findAll(): Promise<DegreeCourseEntity[]> {
        return this.repository.find({order: {name: 'ASC'}});
    }

    /** Un corso per id; `null` se non esiste. */
    findById(degreeCourseId: number): Promise<DegreeCourseEntity | null> {
        return this.repository.findOne({where: {degreeCourseId}});
    }

    // Corsi di laurea "assegnati" a un docente: quelli che hanno almeno un
    // insegnamento (subject) tenuto da quel docente. Il legame è indiretto
    // (degreeCourse -> subjects -> teacher); il where annidato genera i join e
    // l'hydration di TypeORM restituisce i corsi distinti.
    findByTeacherId(teacherId: number): Promise<DegreeCourseEntity[]> {
        return this.repository.find({
            where: { subjects: { teacher: { teacherId } } },
            order: { name: 'ASC' },
        });
    }

    /** Un corso per nome esatto; `null` se non esiste (usato per i controlli di unicità). */
    findByName(name: string): Promise<DegreeCourseEntity | null> {
        return this.repository.findOne({where: {name}});
    }

    /** Crea e salva un corso (durata default 3 anni se non specificata). */
    async createOne(dto: CreateDegreeCourseDto): Promise<DegreeCourseEntity> {
        const degreeCourse = this.repository.create({
            name: dto.name,
            yearsDuration: dto.yearsDuration ?? 3,
            department: dto.department
        });
        return this.repository.save(degreeCourse);
    }

    /** Aggiorna i campi forniti; ritorna l'entità aggiornata o `null` se l'id non esiste. */
    async updateOne(degreeCourseId: number, dto: UpdateDegreeCourseDto): Promise<DegreeCourseEntity | null>{
        const degreeCourse = await this.findById(degreeCourseId);
        if(!degreeCourse) return null;
        if(dto.yearsDuration !== undefined) degreeCourse.yearsDuration = dto.yearsDuration;
        if(dto.name !== undefined) degreeCourse.name = dto.name;
        if(dto.department !== undefined) degreeCourse.department = dto.department;
        return this.repository.save(degreeCourse);
    }

    /** Elimina un corso per id; `true` se una riga è stata rimossa. */
    async deleteOne(degreeCourseId: number): Promise<boolean>{
        const result = await this.repository.delete(degreeCourseId);
        return (result.affected ?? 0) > 0;
    }

}
