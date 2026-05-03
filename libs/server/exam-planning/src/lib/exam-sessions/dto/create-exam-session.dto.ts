import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateExamSessionDto {
    @ApiProperty({example: 'Giugno 2026', maxLength: 100})
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @ApiProperty({example: '2026-06-01', description: 'Data di inizio sessione di esami (ISO YYYY-MM-DD)'})
    @IsDateString()
    startDate: string;

    @ApiProperty({example: '2026-06-30', description: 'Data di fine sessione di esami (ISO YYYY-MM-DD)'})
    @IsDateString()
    endDate: string;

    @ApiProperty({example: '2026-04-01', description: 'Data di inizio pianificazione sessione di esami (ISO YYYY-MM-DD)'})
    @IsDateString()
    planningStartDate: string;

    @ApiProperty({example: '2026-04-30', description: 'Data di fine pianificazione sessione di esami (ISO YYYY-MM-DD)'})
    @IsDateString()
    planningEndDate: string;
}
