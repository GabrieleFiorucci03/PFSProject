import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsPositive, Max, Min } from 'class-validator';
import { ExamType } from './exam-type.enum';
import { RoomType } from './room-type.enum';

/** DTO di creazione di un appello d'esame, con data, fascia oraria, tipo aula/esame e riferimenti a materia e sessione. */
export class CreateExamDto {
    @ApiProperty({ example: '2026-06-15', description: "Data dell'appello (ISO YYYY-MM-DD)" })
    @IsDateString({}, { message: "La data dell'esame deve essere una data valida (formato AAAA-MM-GG)" })
    date: string;

    @ApiProperty({ example: 9, description: "Ora di inizio dell'appello (intero, 0-24)" })
    @IsInt({ message: "L'ora di inizio esame deve essere un numero intero" })
    @Min(0, { message: "L'ora di inizio esame non può essere minore di 0" })
    @Max(24, { message: "L'ora di inizio esame non può essere maggiore di 24" })
    startHour: number;

    @ApiProperty({ example: 11, description: "Ora di fine dell'appello (intero, 0-24, deve essere > startHour)" })
    @IsInt({ message: "L'ora di fine esame deve essere un numero intero" })
    @Min(0, { message: "L'ora di fine esame non può essere minore di 0" })
    @Max(24, { message: "L'ora di fine esame non può essere maggiore di 24" })
    endHour: number;

    @ApiProperty({ enum: RoomType, example: RoomType.STANDARD, description: "Tipo di aula richiesto" })
    @IsEnum(RoomType, { message: "Il tipo di aula richiesto non è valido" })
    roomType: RoomType;

    @ApiProperty({ enum: ExamType, example: ExamType.ORAL })
    @IsEnum(ExamType, { message: "Il tipo di esame non è valido" })
    type: ExamType;

    @ApiProperty({ example: 1, description: 'ID della materia' })
    @IsInt({ message: "L'identificativo della materia deve essere un numero intero" })
    @IsPositive({ message: "L'identificativo della materia deve essere un numero positivo" })
    subjectId: number;

    @ApiProperty({ example: 1, description: "ID della sessione d'esame" })
    @IsInt({ message: "L'identificativo della sessione d'esame deve essere un numero intero" })
    @IsPositive({ message: "L'identificativo della sessione d'esame deve essere un numero positivo" })
    examSessionId: number;
}
