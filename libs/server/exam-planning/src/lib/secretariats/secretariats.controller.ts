import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard, UserRole } from '@server/security';
import type { AuthenticatedUser } from '@server/auth';
import { SecretariatsService } from './secretariats.service';
import { CreateSecretariatDto } from './dto/create-secretariat.dto';
import { UpdateSecretariatDto } from './dto/update-secretariat.dto';

/**
 * Endpoint REST per i segretari (`/api/secretariats`).
 * Tutte le rotte sono riservate alla SEGRETERIA. Modifica e eliminazione sono
 * self-only (nel service): un segretario opera solo sul proprio profilo.
 */
@ApiTags('Secretariats APIs')
@Controller('secretariats')
export class SecretariatsController {
    constructor(private readonly service: SecretariatsService) {}

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEGRETERIA)
    @ApiBearerAuth()
    findAll() {
        return this.service.findAll();
    }

    @Get('me')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEGRETERIA)
    @ApiBearerAuth()
    findOwn(@CurrentUser() currentUser: AuthenticatedUser) {
        return this.service.findOwn(currentUser);
    }

    @Get(':secretariatId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEGRETERIA)
    @ApiBearerAuth()
    findById(@Param('secretariatId', ParseIntPipe) secretariatId: number) {
        return this.service.findById(secretariatId);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEGRETERIA)
    @ApiBearerAuth()
    create(@Body() dto: CreateSecretariatDto) {
        return this.service.createOne(dto);
    }

    @Patch(':secretariatId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEGRETERIA)
    @ApiBearerAuth()
    update(
        @Param('secretariatId', ParseIntPipe) secretariatId: number,
        @Body() dto: UpdateSecretariatDto,
        @CurrentUser() currentUser: AuthenticatedUser,
    ) {
        return this.service.updateOne(secretariatId, dto, currentUser);
    }

    @Delete(':secretariatId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEGRETERIA)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    delete(
        @Param('secretariatId', ParseIntPipe) secretariatId: number,
        @CurrentUser() currentUser: AuthenticatedUser,
    ) {
        return this.service.deleteOne(secretariatId, currentUser);
    }
}
