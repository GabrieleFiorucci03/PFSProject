import { Controller, UseGuards, Post, Request, Body, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ServerAuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard, Roles, RolesGuard, UserRole } from '@server/security';

/** Request arricchita con l'utente che il `LocalAuthGuard` mette in `req.user`. */
type RequestWithUser = Request & {
  user: AuthenticatedUser;
};

/** Controller delle rotte di autenticazione (prefisso /auth). */
@ApiTags('Auth APIs')
@Controller('auth')
export class ServerAuthController {
  constructor(private serverAuthService: ServerAuthService) {}

  /**
   * POST /auth/login — rotta pubblica. Il `LocalAuthGuard` valida email+password
   * e popola `req.user`; qui si restituisce il token JWT + l'utente.
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({
          schema: {
              type: 'object',
              properties: {
                  email: { type: 'string', example: 'devis.bianchini@unibs.it' },
                  password: {type: 'string', example: 'Password1!'}
              },
              required: ['email', 'password'],
          },
      })
  login(@Request() req: RequestWithUser) {
    return this.serverAuthService.login(req.user);
  }

  /**
   * POST /auth/register — SEGRETERIA-only. Crea un utente "nudo" (senza profilo
   * docente/segretario) e restituisce subito token + utente. Non è la via normale
   * di onboarding: per creare account reali si usano POST /teachers e /secretariats.
   */
  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SEGRETERIA)
  @ApiBearerAuth()
  @ApiBody({
          schema: {
              type: 'object',
              properties: {
                  name: { type: 'string', example: 'Devis' },
                  email: { type: 'string', example: 'devis.bianchini@unibs.it' },
                  password: {type: 'string', example: 'Password1!'},
                  role: { type: 'string', enum: Object.values(UserRole), example: UserRole.DOCENTE}
              },
              required: ['name', 'email', 'password', 'role'],
          },
      })
  register(@Body(ValidationPipe) dto: RegisterDto) {
    return this.serverAuthService.register(dto);
  }
}
