import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * Decoratore di parametro `@CurrentUser()`: estrae dall'oggetto richiesta
 * l'utente autenticato (`request.user`), popolato dalle strategie Passport dopo
 * la validazione del JWT. Permette ai controller di ricevere direttamente
 * l'utente corrente come argomento, senza leggere a mano la request.
 *
 * Esempio: `findOwn(@CurrentUser() user: AuthenticatedUser) { ... }`
 */
export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    }
);

