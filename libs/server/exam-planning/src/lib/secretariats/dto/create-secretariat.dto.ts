import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

/** DTO di registrazione di un segretario (nome, email, password). Il ruolo SEGRETERIA è forzato dal service. */
export class CreateSecretariatDto {
    @ApiProperty({ example: 'Anna Bianchi', maxLength: 255 })
    @IsString({ message: 'Il nome deve essere una stringa di testo' })
    @IsNotEmpty({ message: 'Il nome è obbligatorio' })
    @MaxLength(255, { message: 'Il nome non può superare i 255 caratteri' })
    name: string;

    @ApiProperty({ example: 'segreteria@unifi.it', maxLength: 320 })
    @IsEmail({}, { message: "L'indirizzo email non è valido" })
    @MaxLength(320, { message: "L'indirizzo email non può superare i 320 caratteri" })
    email: string;

    @ApiProperty({
        example: 'Password1!',
        minLength: 8,
        description: 'Min 8 caratteri, almeno una maiuscola e un simbolo tra ? ^ ! # @',
    })
    @IsString({ message: 'La password deve essere una stringa di testo' })
    @IsNotEmpty({ message: 'La password è obbligatoria' })
    @MinLength(8, { message: 'La password deve contenere almeno 8 caratteri' })
    @Matches(/[A-Z]/, { message: 'La password deve contenere almeno una lettera maiuscola' })
    @Matches(/[?^!#@]/, { message: 'La password deve contenere almeno un simbolo tra ? ^ ! # @' })
    password: string;
}
