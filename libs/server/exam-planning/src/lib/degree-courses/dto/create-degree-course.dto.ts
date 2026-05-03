import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class CreateDegreeCourseDto {
    @ApiProperty({example: 'Ingegneria Informatica', maxLength: 255})
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @ApiProperty({example: 3, minimum: 1, maximum: 6, default: 3, required: false})
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(6)
    yearsDuration?: number;

    @ApiProperty({example: "Dipartimento di ingegneria dell'Informazione", maxLength: 255})
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    department: string;

}
