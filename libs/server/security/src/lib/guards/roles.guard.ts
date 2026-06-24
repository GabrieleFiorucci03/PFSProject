import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../user-role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard di autorizzazione per ruolo. Va usato DOPO il `JwtAuthGuard` (che
 * popola `request.user`): legge i ruoli richiesti dichiarati con `@Roles(...)`
 * e consente l'accesso solo se l'utente corrente ha uno di quei ruoli.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   * Decide se la richiesta può proseguire:
   * - se la rotta non dichiara ruoli (`@Roles`) → accesso libero (true);
   * - se manca l'utente in request → 403 (il JwtAuthGuard non è stato eseguito);
   * - se l'utente non ha uno dei ruoli richiesti → 403;
   * - altrimenti → true.
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Utente non presente nella richiesta');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Permessi insufficienti');
    }

    return true;
  }
}

