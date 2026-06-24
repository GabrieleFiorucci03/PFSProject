import { UserRole } from "@server/security";

/**
 * Contenuto (payload) del JWT firmato al login. `sub` (subject) è l'id utente,
 * convenzione standard dei token JWT. Da questo payload la `JwtStrategy` ricostruisce
 * l'`AuthenticatedUser` a ogni richiesta autenticata.
 */
export interface JwtPayload {
    sub: number;
    email: string;
    role: UserRole;
    name: string;
}
