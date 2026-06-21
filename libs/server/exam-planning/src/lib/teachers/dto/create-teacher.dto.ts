import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateTeacherDto {
    @ApiProperty({ example: 'Mario Rossi', maxLength: 255 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @ApiProperty({ example: 'mario.rossi@unifi.it', maxLength: 320 })
    @IsEmail()
    @MaxLength(320)
    email: string;

    @ApiProperty({
        example: 'Password1!',
        minLength: 8,
        description: 'Min 8 caratteri, almeno una maiuscola e un simbolo tra ? ^ ! # @',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'La password deve contenere almeno 8 caratteri' })
    @Matches(/[A-Z]/, { message: 'La password deve contenere almeno una lettera maiuscola' })
    @Matches(/[?^!#@]/, { message: 'La password deve contenere almeno un simbolo tra ? ^ ! # @' })
    password: string;
}
