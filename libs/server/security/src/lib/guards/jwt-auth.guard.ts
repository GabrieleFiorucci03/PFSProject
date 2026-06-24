import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard che protegge le rotte richiedendo un JWT valido. Si appoggia alla
 * strategia Passport 'jwt' (`JwtStrategy`): estrae il token dall'header
 * Authorization, lo verifica e popola `request.user`. Senza token valido → 401.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {  }


