import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

/** DTO di creazione di un corso di laurea. `yearsDuration` ha default 3 se omesso. */
export class CreateDegreeCourseDto {
    @ApiProperty({example: 'Ingegneria Informatica', maxLength: 255})
    @IsString({ message: 'Il nome del corso di laurea deve essere una stringa di testo' })
    @IsNotEmpty({ message: 'Il nome del corso di laurea è obbligatorio' })
    @MaxLength(255, { message: 'Il nome del corso di laurea non può superare i 255 caratteri' })
    name: string;

    @ApiProperty({example: 3, minimum: 1, maximum: 6, default: 3, required: false})
    @IsOptional()
    @IsInt({ message: 'La durata in anni deve essere un numero intero' })
    @Min(1, { message: 'La durata in anni non può essere minore di 1' })
    @Max(6, { message: 'La durata in anni non può essere maggiore di 6' })
    yearsDuration?: number;

    @ApiProperty({example: "Dipartimento di ingegneria dell'Informazione", maxLength: 255})
    @IsString({ message: 'Il dipartimento deve essere una stringa di testo' })
    @IsNotEmpty({ message: 'Il dipartimento è obbligatorio' })
    @MaxLength(255, { message: 'Il dipartimento non può superare i 255 caratteri' })
    department: string;

}
