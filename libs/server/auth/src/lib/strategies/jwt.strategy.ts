import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Strategia Passport per l'autenticazione tramite JWT (usata dal `JwtAuthGuard`).
 * Estrae il token dall'header `Authorization: Bearer ...`, ne verifica la firma
 * con `SECRET_KEY` e rifiuta i token scaduti.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /** Configura l'estrazione e la verifica del token; fallisce all'avvio se manca SECRET_KEY. */
  constructor() {
    const secret = process.env.SECRET_KEY;

    if (!secret) {
      throw new Error('SECRET_KEY is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Chiamata da Passport dopo aver verificato il token: trasforma il payload del
   * JWT nell'oggetto `AuthenticatedUser` che verrà messo in `request.user`
   * (e reso disponibile ai controller via `@CurrentUser()`).
   */
  validate(payload: JwtPayload): AuthenticatedUser {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name
    };
  }
}

