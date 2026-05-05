import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsPositive, Max, Min } from 'class-validator';
import { ExamType } from './exam-type.enum';
import { RoomType } from './room-type.enum';

export class CreateExamDto {
    @ApiProperty({ example: '2026-06-15', description: "Data dell'appello (ISO YYYY-MM-DD)" })
    @IsDateString()
    date: string;

    @ApiProperty({ example: 9, description: "Ora di inizio dell'appello (intero, 0-24)" })
    @IsInt()
    @Min(0)
    @Max(24)
    startHour: number;

    @ApiProperty({ example: 11, description: "Ora di fine dell'appello (intero, 0-24, deve essere > startHour)" })
    @IsInt()
    @Min(0)
    @Max(24)
    endHour: number;

    @ApiProperty({ enum: RoomType, example: RoomType.STANDARD, description: "Tipo di aula richiesto" })
    @IsEnum(RoomType)
    roomType: RoomType;

    @ApiProperty({ enum: ExamType, example: ExamType.ORAL })
    @IsEnum(ExamType)
    type: ExamType;

    @ApiProperty({ example: 1, description: 'ID della materia' })
    @IsInt()
    @IsPositive()
    subjectId: number;

    @ApiProperty({ example: 1, description: "ID della sessione d'esame" })
    @IsInt()
    @IsPositive()
    examSessionId: number;
}
