import { AuthenticatedUser } from "./authenticated-user.interface";

/**
 * Risposta restituita da login e register: il token JWT da usare nelle chiamate
 * successive (header Authorization) più i dati dell'utente autenticato.
 */
export class AuthResponse {
    access_token: string;
    user: AuthenticatedUser;
}
