import { IsEmail, IsEnum, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";
import { UserRole } from '@server/security';

export class CreateUserDto {
    @IsString({ message: 'Il nome deve essere una stringa di testo' })
    @IsNotEmpty({ message: 'Il nome è obbligatorio' })
    name: string;

    @IsEmail({}, { message: "L'indirizzo email non è valido" })
    @IsNotEmpty({ message: "L'indirizzo email è obbligatorio" })
    email: string;

    @IsString({ message: 'La password deve essere una stringa di testo' })
    @IsNotEmpty({ message: 'La password è obbligatoria' })
    @MinLength(8, { message: 'La password deve contenere almeno 8 caratteri' })
    @Matches(/[A-Z]/, { message: 'La password deve contenere almeno una lettera maiuscola' })
    @Matches(/[?^!#@]/, { message: 'La password deve contenere almeno un simbolo tra ? ^ ! # @' })
    // @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[?^!#@]).{8,}$/, {
    //    message:
    //        'Password troppo debole: min 8 caratteri, maiuscola, minuscola, numero e simbolo (? ^ ! # @)',
    // })
    password: string;

    @IsEnum(UserRole, {
        message: 'Ruolo non valido: usare DOCENTE o SEGRETERIA'
    })
    role: UserRole;
};

