import { Injectable } from "@nestjs/common";
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard per il login: attiva la strategia Passport 'local' (`LocalStrategy`),
 * che valida email + password. Applicato a POST /auth/login.
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}

