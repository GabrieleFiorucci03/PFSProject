import { CreateUserDto } from "@server/users";

/**
 * Dati per la registrazione di un utente via POST /auth/register (SEGRETERIA-only).
 * Coincide con `CreateUserDto` (name, email, password, role): è un alias semantico
 * per la rotta di auth. Crea un utente "nudo" senza profilo, quindi non è la via
 * normale di onboarding (si usano POST /teachers e /secretariats).
 */
export class RegisterDto extends CreateUserDto {}

