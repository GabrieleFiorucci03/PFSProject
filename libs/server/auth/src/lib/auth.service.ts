import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ServerUsersService } from '@server/users';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { AuthResponse } from './interfaces/auth-response.interface';
import { RegisterDto } from './dto/register.dto';

/** Logica di autenticazione: verifica credenziali, emissione token, registrazione. */
@Injectable()
export class ServerAuthService {
    constructor(private readonly usersService: ServerUsersService,
        private readonly jwtService: JwtService) {}

    /**
     * Verifica email + password (usata dalla strategia locale al login).
     * Per non rivelare quali email esistono (no user enumeration), lancia lo stesso
     * 401 "Credenziali non valide" sia se l'email non esiste sia se la password è
     * errata. Se valide, ritorna l'utente SENZA `passwordHash`.
     */
    async validateUser(email: string, password: string): Promise<AuthenticatedUser> {
        const user = await this.usersService.findByEmail(email);

        if(!user) throw new UnauthorizedException('Credenziali non valide');

        const passwordMatches = await bcrypt.compare(password,user.passwordHash);
        if(!passwordMatches) {
            throw new UnauthorizedException('Credenziali non valide');
        }

        const { passwordHash, ...result } = user;
        return result;
    }

    /** Firma un JWT (payload {sub,name,email,role}, scadenza 24h) e lo restituisce con l'utente. */
    async login(user: AuthenticatedUser): Promise<AuthResponse> {
        const payload = {sub: user.id, name: user.name, email: user.email, role: user.role};
        return {access_token: await this.jwtService.signAsync(payload), user}
    }

    /** Crea un nuovo utente e lo autentica subito (ritorna token + utente), senza esporne la password. */
    async register(dto: RegisterDto): Promise<AuthResponse> {
        const user = await this.usersService.create(dto);

        const { passwordHash, ...result } = user;
        return this.login(result);
    }
}

