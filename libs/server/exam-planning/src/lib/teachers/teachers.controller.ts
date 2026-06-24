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
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@ApiTags('Teachers APIs')
@Controller('teachers')
export class TeachersController {
    constructor(private readonly service: TeachersService) {}

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEGRETERIA)
    @ApiBearerAuth()
    findAll() {
        return this.service.findAll();
    }

    @Get('me')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.DOCENTE)
    @ApiBearerAuth()
    findOwn(@CurrentUser() currentUser: AuthenticatedUser) {
        return this.service.findOwn(currentUser);
    }

    @Get(':teacherId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEGRETERIA, UserRole.DOCENTE)
    @ApiBearerAuth()
    findById(
        @Param('teacherId', ParseIntPipe) teacherId: number,
        @CurrentUser() currentUser: AuthenticatedUser,
    ) {
        return this.service.findById(teacherId, currentUser);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEGRETERIA)
    @ApiBearerAuth()
    create(@Body() dto: CreateTeacherDto) {
        return this.service.createOne(dto);
    }

    @Patch(':teacherId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEGRETERIA, UserRole.DOCENTE)
    @ApiBearerAuth()
    update(
        @Param('teacherId', ParseIntPipe) teacherId: number,
        @Body() dto: UpdateTeacherDto,
        @CurrentUser() currentUser: AuthenticatedUser,
    ) {
        return this.service.updateOne(teacherId, dto, currentUser);
    }

    @Delete(':teacherId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SEGRETERIA, UserRole.DOCENTE)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    delete(
        @Param('teacherId', ParseIntPipe) teacherId: number,
        @CurrentUser() currentUser: AuthenticatedUser,
    ) {
        return this.service.deleteOne(teacherId, currentUser);
    }
}
