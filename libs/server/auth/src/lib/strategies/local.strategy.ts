import { Injectable } from "@nestjs/common";
import { Strategy } from 'passport-local';
import { PassportStrategy } from "@nestjs/passport";
import { ServerAuthService } from "../auth.service";
import { AuthenticatedUser } from "../interfaces/authenticated-user.interface";

/**
 * Strategia Passport per il login con email + password (usata dal `LocalAuthGuard`
 * sulla rotta POST /auth/login). Configura `usernameField: 'email'` perché il
 * campo identificativo è l'email, non lo `username` di default.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: ServerAuthService) {
        super({usernameField:'email'});
    }

    /**
     * Verifica le credenziali delegando al service: ritorna l'utente se valide,
     * altrimenti il service lancia `UnauthorizedException` (401). Lo stesso 401
     * vale sia per email inesistente sia per password errata (no user enumeration).
     */
    async validate(email: string, password: string): Promise<AuthenticatedUser>
    {
        return this.authService.validateUser(email,password);
    }
}

