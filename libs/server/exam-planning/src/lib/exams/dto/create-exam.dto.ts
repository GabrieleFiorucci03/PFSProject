import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator';
import { ExamType } from './exam-type.enum';

export class CreateExamDto {
    @ApiProperty({ example: '2026-06-15', description: "Data dell'appello (ISO YYYY-MM-DD)" })
    @IsDateString()
    date: string;

    @ApiProperty({ example: 'Aula Magna', maxLength: 100 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    room: string;

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
