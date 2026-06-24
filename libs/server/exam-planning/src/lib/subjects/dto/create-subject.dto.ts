import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateSubjectDto {
    @ApiProperty({ example: 'Analisi Matematica', maxLength: 255 })
    @IsString({ message: "Il nome dell'insegnamento deve essere una stringa di testo" })
    @IsNotEmpty({ message: "Il nome dell'insegnamento è obbligatorio" })
    @MaxLength(255, { message: "Il nome dell'insegnamento non può superare i 255 caratteri" })
    name: string;

    @ApiProperty({ example: 1, minimum: 1, maximum: 6, description: 'Anno di corso' })
    @IsInt({ message: "L'anno di corso deve essere un numero intero" })
    @Min(1, { message: "L'anno di corso non può essere minore di 1" })
    @Max(6, { message: "L'anno di corso non può essere maggiore di 6" })
    year: number;

    @ApiProperty({ example: 9, minimum: 1, maximum: 30, description: 'Crediti formativi (CFU)' })
    @IsInt({ message: 'I crediti formativi (CFU) devono essere un numero intero' })
    @Min(1, { message: 'I crediti formativi (CFU) non possono essere minori di 1' })
    @Max(30, { message: 'I crediti formativi (CFU) non possono essere maggiori di 30' })
    cfu: number;

    @ApiProperty({ example: 1, description: 'ID del corso di laurea' })
    @IsInt({ message: "L'identificativo del corso di laurea deve essere un numero intero" })
    @IsPositive({ message: "L'identificativo del corso di laurea deve essere un numero positivo" })
    degreeCourseId: number;

    @ApiProperty({ example: 1, description: 'ID del docente titolare' })
    @IsInt({ message: "L'identificativo del docente deve essere un numero intero" })
    @IsPositive({ message: "L'identificativo del docente deve essere un numero positivo" })
    teacherId: number;
}
