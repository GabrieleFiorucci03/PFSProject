import { SetMetadata } from "@nestjs/common";
import { UserRole } from '../user-role.enum';

/** Chiave dei metadati sotto cui vengono salvati i ruoli richiesti da una rotta. */
export const ROLES_KEY = 'roles';

/**
 * Decoratore `@Roles(...)`: marca un handler/controller con i ruoli ammessi ad
 * accedervi. Il `RolesGuard` legge questi metadati (via `ROLES_KEY`) e nega
 * l'accesso (403) a chi non ha uno dei ruoli indicati.
 *
 * Esempio: `@Roles(UserRole.SEGRETERIA)` → solo la segreteria può chiamare la rotta.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY,roles);


