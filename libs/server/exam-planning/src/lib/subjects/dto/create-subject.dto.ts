import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateSubjectDto {
    @ApiProperty({ example: 'Analisi Matematica', maxLength: 255 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @ApiProperty({ example: 1, minimum: 1, maximum: 6, description: 'Anno di corso' })
    @IsInt()
    @Min(1)
    @Max(6)
    year: number;

    @ApiProperty({ example: 9, minimum: 1, maximum: 30, description: 'Crediti formativi (CFU)' })
    @IsInt()
    @Min(1)
    @Max(30)
    cfu: number;

    @ApiProperty({ example: 1, description: 'ID del corso di laurea' })
    @IsInt()
    @IsPositive()
    degreeCourseId: number;

    @ApiProperty({ example: 1, description: 'ID del docente titolare' })
    @IsInt()
    @IsPositive()
    teacherId: number;
}
