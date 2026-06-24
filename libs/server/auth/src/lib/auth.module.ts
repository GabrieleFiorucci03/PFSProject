import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ServerUsersModule } from '@server/users';
import { ServerAuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ServerAuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import 'dotenv/config';

/**
 * Modulo di autenticazione. Configura Passport e il JwtModule (firma dei token
 * con `SECRET_KEY`, scadenza 24h), registra le due strategie (locale per il login
 * con email/password, jwt per le rotte protette) ed espone `ServerAuthService`
 * agli altri moduli. Importa `ServerUsersModule` per leggere/creare gli utenti.
 */
@Module({
  imports: [
    ServerUsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '24h' }
    })
  ],
  controllers: [ServerAuthController],
  providers: [ServerAuthService,LocalStrategy,JwtStrategy],
  exports: [ServerAuthService],
})
export class ServerAuthModule {}

