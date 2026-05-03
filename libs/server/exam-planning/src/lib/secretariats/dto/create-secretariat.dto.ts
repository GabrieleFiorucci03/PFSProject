import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateSecretariatDto {
    @ApiProperty({ example: 'Anna Bianchi', maxLength: 255 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @ApiProperty({ example: 'segreteria@unifi.it', maxLength: 320 })
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
    @MinLength(8)
    @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    @Matches(/[?^!#@]/, { message: 'Password must contain at least one symbol among ? ^ ! # @' })
    password: string;
}
