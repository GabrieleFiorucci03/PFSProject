import { IsEmail, IsEnum, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";
import { UserRole } from '@server/security';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
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

