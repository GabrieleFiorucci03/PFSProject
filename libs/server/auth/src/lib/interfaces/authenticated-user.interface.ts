import { UserRole } from "@server/security";

/**
 * Utente autenticato così come viaggia nell'app a runtime: è ciò che le strategie
 * Passport mettono in `request.user` e che i controller ricevono con `@CurrentUser()`.
 * Non contiene mai la password (`passwordHash` è rimossa dal service di auth).
 */
export interface AuthenticatedUser {
    id: number;
    email: string;
    role: UserRole;
    name: string;
}

