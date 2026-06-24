import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateExamSessionDto {
    @ApiProperty({example: 'Giugno 2026', maxLength: 100})
    @IsString({ message: 'Il nome della sessione deve essere una stringa di testo' })
    @IsNotEmpty({ message: 'Il nome della sessione è obbligatorio' })
    @MaxLength(100, { message: 'Il nome della sessione non può superare i 100 caratteri' })
    name: string;

    @ApiProperty({example: '2026-06-01', description: 'Data di inizio sessione di esami (ISO YYYY-MM-DD)'})
    @IsDateString({}, { message: 'La data di inizio sessione deve essere una data valida (formato AAAA-MM-GG)' })
    startDate: string;

    @ApiProperty({example: '2026-06-30', description: 'Data di fine sessione di esami (ISO YYYY-MM-DD)'})
    @IsDateString({}, { message: 'La data di fine sessione deve essere una data valida (formato AAAA-MM-GG)' })
    endDate: string;

    @ApiProperty({example: '2026-04-01', description: 'Data di inizio pianificazione sessione di esami (ISO YYYY-MM-DD)'})
    @IsDateString({}, { message: 'La data di inizio pianificazione deve essere una data valida (formato AAAA-MM-GG)' })
    planningStartDate: string;

    @ApiProperty({example: '2026-04-30', description: 'Data di fine pianificazione sessione di esami (ISO YYYY-MM-DD)'})
    @IsDateString({}, { message: 'La data di fine pianificazione deve essere una data valida (formato AAAA-MM-GG)' })
    planningEndDate: string;
}
